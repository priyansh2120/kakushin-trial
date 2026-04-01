import { generateStructuredResponse } from "../geminiClient.js";

const SYSTEM_INSTRUCTION = `You are SmartLit's Smart Categorizer AI. You automatically categorize financial 
transactions and estimate their necessity score.

Given a transaction description and/or amount, you must return a JSON object with:
{
  "category": string (one of: "Food", "Transport", "Entertainment", "Education", "Health", "Shopping", "Bills", "Savings", "Investment", "Other"),
  "necessityPercentage": number (0-100, where 100 is absolutely necessary like rent/medicine, 0 is completely discretionary like luxury items),
  "confidence": number (0-1, your confidence in the categorization),
  "suggestion": string (a brief tip about this type of expense),
  "tags": [string] (relevant tags for this expense)
}

Guidelines for necessity scoring:
- 90-100: Essential (rent, medicine, basic food, utilities)
- 70-89: Important (education, health insurance, work transport)
- 40-69: Moderate (dining out occasionally, gym, moderate clothing)
- 20-39: Low necessity (entertainment, luxury food, gadgets)
- 0-19: Discretionary (luxury items, impulse purchases)`;

export const categorizeExpense = async (description, amount) => {
  const prompt = `Categorize this transaction:
Description: "${description}"
Amount: ₹${amount}

Return the categorization as JSON.`;

  return await generateStructuredResponse(prompt, SYSTEM_INSTRUCTION);
};

export const batchCategorize = async (transactions) => {
  const prompt = `Categorize these transactions and return a JSON array:
${transactions.map((t, i) => `${i + 1}. Description: "${t.description}", Amount: ₹${t.amount}`).join("\n")}

Return as: { "categorizations": [{ "index": number, "category": string, "necessityPercentage": number, "confidence": number }] }`;

  return await generateStructuredResponse(prompt, SYSTEM_INSTRUCTION);
};
