import { generateStructuredResponse } from "../geminiClient.js";

const SYSTEM_INSTRUCTION = `You are SmartLit's Expense Analyzer AI. You perform deep analysis of spending patterns
and provide actionable insights. You always respond in valid JSON format.

Your analysis includes:
1. Spending pattern detection (recurring costs, seasonal trends)
2. Anomaly detection (unusual spending spikes)
3. Category-wise health scores (0-100)
4. Savings opportunities identification
5. Predictive spending forecast for next month
6. Personalized recommendations

Always return your response as a JSON object with the following structure:
{
  "overallHealthScore": number (0-100),
  "monthlyBudgetStatus": "under_budget" | "on_track" | "over_budget",
  "insights": [{ "type": "pattern" | "anomaly" | "tip" | "warning", "title": string, "description": string, "impact": "high" | "medium" | "low" }],
  "categoryScores": [{ "category": string, "score": number, "suggestion": string }],
  "savingsOpportunities": [{ "area": string, "potentialSaving": number, "action": string }],
  "nextMonthPrediction": { "estimatedTotal": number, "confidence": "high" | "medium" | "low", "breakdown": object }
}`;

export const analyzeExpenses = async (expenses, incomes, userProfile) => {
  if (!expenses || expenses.length === 0) {
    return getEmptyAnalysis();
  }

  const prompt = buildAnalysisPrompt(expenses, incomes, userProfile);
  return await generateStructuredResponse(prompt, SYSTEM_INSTRUCTION);
};

const buildAnalysisPrompt = (expenses, incomes, user) => {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomes
    ? incomes.reduce((sum, i) => sum + i.amount, 0)
    : 0;

  const categories = {};
  const dailySpending = {};

  expenses.forEach((e) => {
    categories[e.category] = (categories[e.category] || 0) + e.amount;
    const dateKey = new Date(e.date).toISOString().split("T")[0];
    dailySpending[dateKey] = (dailySpending[dateKey] || 0) + e.amount;
  });

  const avgNecessity =
    expenses.reduce((sum, e) => sum + e.necessityPercentage, 0) /
    expenses.length;

  return `Analyze the following financial data for a ${user?.age || "unknown age"} year old ${user?.profession || "professional"}:

EXPENSE SUMMARY:
- Total Expenses: ₹${totalExpenses}
- Total Income: ₹${totalIncome}
- Savings Rate: ${totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : "N/A"}%
- Average Necessity Score: ${avgNecessity.toFixed(1)}%
- Number of Transactions: ${expenses.length}

CATEGORY BREAKDOWN:
${Object.entries(categories)
  .map(([cat, amt]) => `- ${cat}: ₹${amt} (${((amt / totalExpenses) * 100).toFixed(1)}%)`)
  .join("\n")}

DAILY SPENDING PATTERN:
${Object.entries(dailySpending)
  .sort(([a], [b]) => a.localeCompare(b))
  .slice(-14)
  .map(([date, amt]) => `- ${date}: ₹${amt}`)
  .join("\n")}

INDIVIDUAL EXPENSES (last 20):
${expenses
  .slice(-20)
  .map((e) => `- ₹${e.amount} | ${e.category} | Necessity: ${e.necessityPercentage}% | ${e.description || "No description"}`)
  .join("\n")}

Provide a comprehensive financial health analysis with actionable insights.`;
};

const getEmptyAnalysis = () => ({
  overallHealthScore: 50,
  monthlyBudgetStatus: "on_track",
  insights: [
    {
      type: "tip",
      title: "Start Tracking",
      description:
        "Add your first expenses to get personalized AI-powered financial insights!",
      impact: "high",
    },
  ],
  categoryScores: [],
  savingsOpportunities: [],
  nextMonthPrediction: {
    estimatedTotal: 0,
    confidence: "low",
    breakdown: {},
  },
});
