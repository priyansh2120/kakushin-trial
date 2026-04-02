const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_TEXT_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_STRUCTURED_MODEL = "llama-3.3-70b-versatile";

const getGroqApiKey = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }
  return apiKey;
};

const getTextModel = () =>
  process.env.GROQ_TEXT_MODEL || process.env.GROQ_MODEL || DEFAULT_TEXT_MODEL;

const getStructuredModel = () =>
  process.env.GROQ_STRUCTURED_MODEL ||
  process.env.GROQ_MODEL ||
  DEFAULT_STRUCTURED_MODEL;

const callGroq = async ({
  prompt,
  systemInstruction,
  model,
  temperature = 0.2,
  maxTokens = 1200,
}) => {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getGroqApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data?.error?.message || `Groq request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  return content.trim();
};

const extractJsonObject = (text) => {
  const trimmed = text.trim();
  const directParse = tryParseJson(trimmed);
  if (directParse !== null) {
    return directParse;
  }

  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i) ||
    trimmed.match(/```\s*([\s\S]*?)```/);
  if (fencedMatch) {
    const fencedParse = tryParseJson(fencedMatch[1].trim());
    if (fencedParse !== null) {
      return fencedParse;
    }
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const slicedParse = tryParseJson(trimmed.slice(firstBrace, lastBrace + 1));
    if (slicedParse !== null) {
      return slicedParse;
    }
  }

  throw new Error(`Failed to parse structured AI response: ${trimmed}`);
};

const tryParseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const getModel = (modelName = DEFAULT_TEXT_MODEL) => ({
  provider: "groq",
  model: modelName,
});

export const generateStructuredResponse = async (prompt, systemInstruction) => {
  const structuredInstruction = `${systemInstruction}

You must respond with only valid JSON.
- Do not use markdown or code fences
- Do not include any explanation before or after the JSON
- Ensure all keys and string values are valid JSON`;

  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const text = await callGroq({
        prompt,
        systemInstruction: structuredInstruction,
        model: getStructuredModel(),
        temperature: 0.1,
        maxTokens: 1800,
      });
      return extractJsonObject(text);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export const generateTextResponse = async (prompt, systemInstruction) => {
  return await callGroq({
    prompt,
    systemInstruction,
    model: getTextModel(),
    temperature: 0.4,
    maxTokens: 900,
  });
};
