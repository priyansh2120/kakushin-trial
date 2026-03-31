import { generateStructuredResponse, generateTextResponse } from "./geminiClient.js";
import { getFinancialAdvice } from "./agents/financialAdvisor.js";
import { analyzeExpenses } from "./agents/expenseAnalyzer.js";
import { categorizeExpense } from "./agents/smartCategorizer.js";
import { generateQuiz } from "./agents/quizGenerator.js";

const ROUTER_SYSTEM_INSTRUCTION = `You are SmartLit's AI Orchestrator. Your job is to classify user intent 
and route their query to the appropriate specialized AI agent.

Available agents:
1. "financial_advisor" - For financial advice, budgeting tips, investment education, financial concepts, savings strategies
2. "expense_analyzer" - For spending analysis, expense patterns, financial health assessment, budget review
3. "smart_categorizer" - For categorizing expenses, understanding necessity of purchases
4. "quiz_generator" - For generating quiz questions, testing financial knowledge, learning exercises
5. "general_chat" - For greetings, general questions, off-topic queries, or when intent is unclear

You must return a JSON object:
{
  "agent": string (one of the agent names above),
  "confidence": number (0-1),
  "refinedQuery": string (the user's query reformulated for the target agent)
}`;

export const routeQuery = async (query) => {
  const prompt = `Classify this user query and determine which agent should handle it:\n"${query}"`;
  return await generateStructuredResponse(prompt, ROUTER_SYSTEM_INSTRUCTION);
};

export const processQuery = async (query, userContext) => {
  try {
    const routing = await routeQuery(query);
    let response;
    let agentUsed = routing.agent;

    switch (routing.agent) {
      case "financial_advisor":
        response = await getFinancialAdvice(
          routing.refinedQuery || query,
          userContext
        );
        break;

      case "expense_analyzer":
        response = await analyzeExpenses(
          userContext?.expenses || [],
          userContext?.incomes || [],
          userContext?.user
        );
        break;

      case "smart_categorizer":
        response = await categorizeExpense(routing.refinedQuery || query, 0);
        break;

      case "quiz_generator":
        response = await generateQuiz(userContext?.user, 3);
        break;

      case "general_chat":
      default:
        agentUsed = "general_chat";
        response = await generateTextResponse(
          `User query: ${query}\n\nRespond helpfully as SmartLit, a financial literacy chatbot. Be friendly and guide users toward financial topics.`,
          "You are SmartLit, a friendly financial literacy chatbot. Keep responses concise and helpful. If the user asks something unrelated to finance, gently steer the conversation back to financial topics."
        );
        break;
    }

    return {
      agent: agentUsed,
      confidence: routing.confidence,
      response,
      isStructured: typeof response === "object",
    };
  } catch (error) {
    console.error("AI Orchestrator error:", error);
    throw new Error("Failed to process AI query: " + error.message);
  }
};
