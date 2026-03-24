import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAIResponse(
  message: string,
  companyName: string,
  knowledge: string
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return "AI service is not configured.";
  }

  try {

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are a professional AI assistant for ${companyName}.

Answer ONLY using the company knowledge below.

If the answer is not found reply:
"I don't have that information. Please contact the company directly."

Company Knowledge:
${knowledge}

User Question:
${message}
`;

    const result = await model.generateContent(prompt);

    return result.response.text();

  } catch (error) {

    console.error("AI Error:", error);

    return "Our AI assistant is temporarily unavailable.";

  }
}
