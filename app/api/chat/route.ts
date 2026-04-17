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

    if (!message || !visitorId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400, headers: corsHeaders });
    }

    const supabase = await createClient();

    async function insertMessageWithFallback(payload: Record<string, unknown>) {
      const primary = await supabase.from("messages").insert(payload);

      if (!primary.error) {
        return primary;
      }

      const errorText = `${primary.error.code || ""} ${primary.error.message || ""}`.toLowerCase();

      if (
        "company_id" in payload &&
        (errorText.includes("company_id") ||
          errorText.includes("column") ||
          errorText.includes("does not exist"))
      ) {
        const { company_id, ...fallbackPayload } = payload as any;
        return await supabase.from("messages").insert(fallbackPayload);
      }

      return primary;
    }

    // 1. Find Company
    let companyQuery = supabase.from("companies").select("*");

    if (companySlug) {
      companyQuery = companyQuery.eq("slug", companySlug);
    } else {
      companyQuery = companyQuery.order("created_at", { ascending: false }).limit(1);
    }

    let { data: company, error: companyError } = await companyQuery.maybeSingle();

    if ((!company || companyError) && companySlug) {
      const fallbackCompany = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      company = fallbackCompany.data;
      companyError = fallbackCompany.error;
    }

    if (companyError || !company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 2️⃣ Check Plan Limit
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let count: number | null = null;
    try {
      const countResult = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("company_id", company.id)
        .gte("created_at", startOfMonth.toISOString());

      count = countResult.count ?? 0;
    } catch (countError) {
      console.error("Message count query failed:", countError);
    }

    if (company.chat_limit !== -1 && (count ?? 0) >= company.chat_limit) {
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
    const userMessageInsert = await insertMessageWithFallback({
      company_id: company.id,
      conversation_id: currentConvId,
      role: "user",
      content: message,
    });

    if (userMessageInsert.error) {
      throw userMessageInsert.error;
    }

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

    // Fetch History
const { data: historyData } = await supabase
  .from("messages")
  .select("role, content")
  .eq("conversation_id", currentConvId)
  .order("created_at", { ascending: true })
  .limit(10);

// Convert history
const chatHistory: Content[] = (historyData || [])
  .filter(m => m.content !== message)
  .map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

const fallbackResponse =
  company.settings?.widget?.welcome_message ||
  `Thanks for reaching out to ${company.name}. Our team will get back to you shortly.`;

let aiResponse = fallbackResponse;

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY missing");
} else {
  try {

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `
You are a professional AI assistant for ${company.name}.

Answer ONLY using the company knowledge.

If the answer is not found reply:
"I don't have that information. Please contact the company directly."

Company Knowledge:
${companyKnowledge}
`,
    });

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);

    aiResponse = result.response.text();

  } catch (err) {

    console.error("Gemini Error:", err);

    aiResponse = fallbackResponse;

  }
}
    // 5. Save AI Response
    const aiMessageInsert = await insertMessageWithFallback({
      company_id: company.id,
      conversation_id: currentConvId,
      role: "assistant",
      content: aiResponse,
    });

    if (aiMessageInsert.error) {
      throw aiMessageInsert.error;
    }

    await supabase.rpc("increment_chat_count", {
      company_id: company.id,
    });

    const widgetSettings = company.settings?.widget || {
  primary_color: "#000",
  welcome_message: "Hi 👋 How can we help you?"
};

return NextResponse.json(
  {
    response: aiResponse,
    conversationId: currentConvId,
    widget: widgetSettings
  },
  { headers: corsHeaders }
);

  } catch (error: any) {
    console.error("Full Error Log:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
