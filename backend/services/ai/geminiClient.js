import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;

export const getGeminiClient = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

export const getModel = (modelName = "gemini-2.0-flash") => {
  const client = getGeminiClient();
  return client.getGenerativeModel({ model: modelName });
};

export const generateStructuredResponse = async (prompt, systemInstruction) => {
  const model = getGeminiClient().getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
};

export const generateTextResponse = async (prompt, systemInstruction) => {
  const model = getGeminiClient().getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction,
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
};
