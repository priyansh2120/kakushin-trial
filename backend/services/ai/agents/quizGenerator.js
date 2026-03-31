import { generateStructuredResponse } from "../geminiClient.js";

const SYSTEM_INSTRUCTION = `You are SmartLit's AI Quiz Generator. You create personalized financial literacy 
quiz questions based on the user's profile, knowledge gaps, and learning progress.

You must always return a JSON object with this structure:
{
  "questions": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctAnswer": string (must be one of the options),
      "explanation": string (brief explanation of why this is correct),
      "difficulty": "easy" | "medium" | "hard",
      "topic": string (e.g., "Budgeting", "Investing", "Savings", "Credit", "Insurance", "Tax")
    }
  ]
}

Guidelines:
- Create questions relevant to the Indian financial context (₹, Indian banks, SEBI, etc.)
- Adjust difficulty based on the user's age and financial literacy score
- For younger users (< 18): Focus on basic budgeting, saving, expense tracking
- For working professionals: Include investing, tax planning, insurance
- Questions should be practical and scenario-based when possible
- Each question must have exactly 4 options
- The correctAnswer must exactly match one of the options`;

export const generateQuiz = async (userProfile, numQuestions = 5, topic = null) => {
  let prompt = `Generate ${numQuestions} financial literacy quiz questions`;

  if (userProfile) {
    prompt += ` for a ${userProfile.age}-year-old ${userProfile.profession}`;
    prompt += ` with a financial literacy score of ${userProfile.financialLiteracy}/100`;
  }

  if (topic) {
    prompt += ` focused on the topic: ${topic}`;
  }

  prompt += `.\n\nMake questions progressively harder. Include a mix of concept-based and scenario-based questions.`;

  return await generateStructuredResponse(prompt, SYSTEM_INSTRUCTION);
};
