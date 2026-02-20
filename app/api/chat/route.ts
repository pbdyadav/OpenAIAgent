import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { companySlug, message, visitorId, conversationId } = await request.json();

    if (!companySlug || !message || !visitorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Find company by slug
    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", companySlug)
      .single();

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get knowledge base documents
    const { data: documents } = await supabase
      .from("knowledge_documents")
      .select("content")
      .eq("company_id", company.id)
      .eq("status", "processed");

    const knowledgeBase = documents?.map((d) => d.content).join("\n\n") || "";

    // Find or create conversation
    let conversation;
    if (conversationId) {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .eq("company_id", company.id)
        .single();
      conversation = data;
    }

    if (!conversation) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({
          company_id: company.id,
          visitor_id: visitorId,
          channel: "web",
          status: "active",
        })
        .select()
        .single();
      conversation = newConv;
    }

    if (!conversation) {
      return NextResponse.json(
        { error: "Failed to create conversation" },
        { status: 500 }
      );
    }

    // Save user message
    await supabase.from("messages").insert({
      company_id: company.id,
      conversation_id: conversation.id,
      role: "user",
      content: message,
    });

    // Get conversation history
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(20);

    // Build AI prompt
    const welcomeMessage = company.settings?.welcome_message || "Hi! How can I help you today?";
    const personality = company.settings?.ai_personality || "helpful and professional";

    const systemPrompt = `You are a ${personality} AI assistant for ${company.name}. 
Your job is to help customers by answering their questions based on the following knowledge base.
If you don't know the answer from the knowledge base, politely say you don't have that information and suggest they contact the company directly.

Knowledge Base:
${knowledgeBase || "No knowledge base documents have been uploaded yet."}

Remember to be ${personality} in all your responses.`;

    // TODO: Integrate with Google AI Studio
    // For now, return a simple response
    const aiResponse = knowledgeBase 
      ? `Thank you for your question about "${message.substring(0, 50)}...". Based on our knowledge base, I'll do my best to help you. However, full AI responses will be available once Google AI Studio integration is complete.`
      : "Thank you for reaching out! Our knowledge base is still being set up. Please check back soon or contact us directly for assistance.";

    // Save AI response
    await supabase.from("messages").insert({
      company_id: company.id,
      conversation_id: conversation.id,
      role: "assistant",
      content: aiResponse,
    });

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversation.id);

    return NextResponse.json({
      response: aiResponse,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("[v0] Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
