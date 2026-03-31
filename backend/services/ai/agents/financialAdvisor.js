import { generateTextResponse } from "../geminiClient.js";

const SYSTEM_INSTRUCTION = `You are SmartLit's Financial Advisor AI — an expert in personal finance, budgeting, 
investing, and financial literacy. You provide personalized, actionable advice.

CAPABILITIES:
- Analyze spending patterns and suggest improvements
- Create personalized budget plans
- Explain financial concepts in simple terms
- Suggest savings strategies based on income and expenses
- Provide investment education appropriate to the user's age and risk profile
- Help set and track financial goals

RULES:
- Always be encouraging and supportive
- Tailor advice to the user's age, profession, and financial situation
- Use simple language for younger users (teens)
- Never recommend specific stocks or guaranteed returns
- Always include actionable next steps
- Reference the user's actual financial data when available
- Keep responses concise but comprehensive (200-400 words)`;

export const getFinancialAdvice = async (query, userContext) => {
  const contextPrompt = buildContextPrompt(userContext);
  const fullPrompt = `${contextPrompt}\n\nUser Question: ${query}`;

  return await generateTextResponse(fullPrompt, SYSTEM_INSTRUCTION);
};

const buildContextPrompt = (ctx) => {
  if (!ctx) return "No user context available.";

  let prompt = "USER FINANCIAL PROFILE:\n";

  if (ctx.user) {
    prompt += `- Name: ${ctx.user.name}\n`;
    prompt += `- Age: ${ctx.user.age}\n`;
    prompt += `- Profession: ${ctx.user.profession}\n`;
    prompt += `- Monthly Income: ₹${ctx.user.income || "Not specified"}\n`;
    prompt += `- Financial Literacy Score: ${ctx.user.financialLiteracy}/100\n`;
    prompt += `- Virtual Currency (engagement): ${ctx.user.virtualCurrency}\n`;
  }

  if (ctx.expenses && ctx.expenses.length > 0) {
    const totalExpenses = ctx.expenses.reduce((sum, e) => sum + e.amount, 0);
    const categories = {};
    ctx.expenses.forEach((e) => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });
    const avgNecessity =
      ctx.expenses.reduce((sum, e) => sum + e.necessityPercentage, 0) /
      ctx.expenses.length;

    prompt += `\nSPENDING DATA (Recent):\n`;
    prompt += `- Total Expenses: ₹${totalExpenses}\n`;
    prompt += `- Average Necessity Score: ${avgNecessity.toFixed(1)}%\n`;
    prompt += `- Category Breakdown: ${JSON.stringify(categories)}\n`;
    prompt += `- Number of transactions: ${ctx.expenses.length}\n`;
  }

  if (ctx.incomes && ctx.incomes.length > 0) {
    const totalIncome = ctx.incomes.reduce((sum, i) => sum + i.amount, 0);
    const sources = {};
    ctx.incomes.forEach((i) => {
      sources[i.source] = (sources[i.source] || 0) + i.amount;
    });

    prompt += `\nINCOME DATA:\n`;
    prompt += `- Total Income: ₹${totalIncome}\n`;
    prompt += `- Income Sources: ${JSON.stringify(sources)}\n`;
  }

  if (ctx.monthlySavings && ctx.monthlySavings.length > 0) {
    prompt += `\nMONTHLY SAVINGS TREND:\n`;
    ctx.monthlySavings.slice(-6).forEach((s) => {
      prompt += `- ${s.month}/${s.year}: ₹${s.amount}\n`;
    });
  }

  return prompt;
};
