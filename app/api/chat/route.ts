export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI, Content } from "@google/generative-ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companySlug, message, visitorId } = body;

    if (!companySlug || !message || !visitorId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400, headers: corsHeaders });
    }

    const supabase = await createClient();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);


    // 1. Find Company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", companySlug)
      .maybeSingle();

    if (companyError || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404, headers: corsHeaders });
    }

    // 2️⃣ Check Plan Limit
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("company_id", company.id)
      .gte("created_at", startOfMonth.toISOString());

    if (company.chat_limit !== -1 && (count || 0) >= company.chat_limit) {
      return NextResponse.json(
        {
          response: "Your monthly chat limit has been reached. Please upgrade your plan."
        },
        { headers: corsHeaders }
      );
    }

    // 3. Get/Create Conversation
    let { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("visitor_id", visitorId)
      .eq("company_id", company.id)
      .maybeSingle();

    if (!conversation) {
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({ company_id: company.id, visitor_id: visitorId, channel: "website" })
        .select()
        .single();

      if (createError) throw createError;
      conversation = newConv;
    }

    const currentConvId = conversation!.id;

    // 4. Save User Message
    await supabase.from("messages").insert({
      company_id: company.id,
      conversation_id: currentConvId,
      role: "user",
      content: message,
    });

    // 4.5 Fetch Company Knowledge
    const { data: knowledgeDocs } = await supabase
      .from("knowledge_documents")
      .select("content")
      .eq("company_id", company.id)
      .eq("processed", true);

    let companyKnowledge = "";

    if (knowledgeDocs && knowledgeDocs.length > 0) {
      companyKnowledge = knowledgeDocs
        .map(doc => doc.content)
        .join("\n\n---\n\n")
        .slice(0, 15000); // token safety limit
    }

    // 6. DEBUG: Yeh line check karein ki API key ko kya models dikh rahe hain
    try {
      const modelListRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
      const modelListData = await modelListRes.json();

      console.log("KNOWLEDGE LENGTH:", companyKnowledge.length);
      console.log("KNOWLEDGE PREVIEW:", companyKnowledge.slice(0, 300));
      console.log("AVAILABLE MODELS:", modelListData.models?.map((m: any) => m.name));
      console.log("Incoming message:", message);
      console.log("Company:", companySlug);
      console.log("API KEY:", process.env.GEMINI_API_KEY);

    } catch (e) {
      console.log("Could not fetch models");
    }
    console.log("KNOWLEDGE DOC COUNT:", knowledgeDocs?.length);
    console.log("KNOWLEDGE LENGTH:", companyKnowledge.length);

    // 4. Gemini SDK Setup
    let aiResponse = "I'm currently unavailable.";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing in .env.local");
    } else {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Fetch History for Context BEFORE sending new message
        const { data: historyData } = await supabase
          .from("messages")
          .select("role, content")
          .eq("conversation_id", currentConvId)
          .order("created_at", { ascending: true })
          .limit(10);

        // Convert history to Gemini format
        const chatHistory: Content[] = (historyData || [])
          .filter(m => m.content !== message) // Naya message history mein repeat na ho
          .map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          systemInstruction: `
You are a professional AI assistant for ${company.name}.

You MUST answer strictly using the provided company knowledge below.

If the answer is not found in the knowledge, reply:
"I don't have that information. Please contact the company directly."

Company Knowledge:
-------------------
${companyKnowledge}
`,
        });

        const chat = model.startChat({
          history: chatHistory,
        });

        const result = await chat.sendMessage(message);
        aiResponse = result.response.text();

      } catch (err: any) {
        console.error("Gemini Error:", err);
        aiResponse = "I am having trouble connecting to my brain. Error: " + err.message;
      }
    }

    // 5. Save AI Response
    await supabase.from("messages").insert({
      company_id: company.id,
      conversation_id: currentConvId,
      role: "assistant",
      content: aiResponse,
    });

    return NextResponse.json(
      { response: aiResponse, conversationId: currentConvId },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error("Full Error Log:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}