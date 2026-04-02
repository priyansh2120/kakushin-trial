/**
 * Expense Intelligence Pipeline
 * Categorizes expenses as essential/discretionary using rule-based classification.
 */

// Rule-based category classification
const ESSENTIAL_CATEGORIES = new Set([
  "rent", "housing", "mortgage",
  "groceries", "food", "utilities",
  "electricity", "water", "gas",
  "health", "medical", "medicine", "insurance",
  "education", "school", "tuition",
  "transport", "commute", "fuel", "petrol",
  "loan", "emi", "debt",
  "emergency",
]);

const DISCRETIONARY_CATEGORIES = new Set([
  "entertainment", "movies", "gaming",
  "shopping", "clothing", "fashion",
  "dining", "restaurant", "cafe",
  "subscription", "ott", "streaming",
  "travel", "vacation", "holiday",
  "gadgets", "electronics",
  "beauty", "salon", "spa",
  "gifts", "party",
]);

/**
 * Classify an expense as essential or discretionary.
 * Uses category matching + necessity percentage as signals.
 */
export const classifyExpense = (expense) => {
  const category = (expense.category || "").toLowerCase().trim();
  const necessity = expense.necessityPercentage || 50;

  // Check rule-based category match
  if (ESSENTIAL_CATEGORIES.has(category)) {
    return { type: "essential", confidence: 0.9 };
  }
  if (DISCRETIONARY_CATEGORIES.has(category)) {
    return { type: "discretionary", confidence: 0.9 };
  }

  // Fall back to necessity percentage
  if (necessity >= 60) {
    return { type: "essential", confidence: 0.7 };
  }
  if (necessity <= 40) {
    return { type: "discretionary", confidence: 0.7 };
  }

  return { type: "mixed", confidence: 0.5 };
};

/**
 * Analyze a batch of expenses and return analytics.
 */
export const analyzeExpenseBatch = (expenses) => {
  if (!expenses || expenses.length === 0) {
    return {
      total: 0,
      essentialTotal: 0,
      discretionaryTotal: 0,
      essentialRatio: 0,
      categoryBreakdown: [],
      classifications: [],
    };
  }

  const categoryMap = {};
  let essentialTotal = 0;
  let discretionaryTotal = 0;
  const classifications = [];

  for (const expense of expenses) {
    const classification = classifyExpense(expense);
    classifications.push({ expenseId: expense._id, ...classification });

    if (classification.type === "essential") {
      essentialTotal += expense.amount;
    } else {
      discretionaryTotal += expense.amount;
    }

    const cat = expense.category || "Other";
    if (!categoryMap[cat]) {
      categoryMap[cat] = { amount: 0, count: 0 };
    }
    categoryMap[cat].amount += expense.amount;
    categoryMap[cat].count += 1;
  }

  const total = essentialTotal + discretionaryTotal;
  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, data]) => ({
      category,
      amount: Math.round(data.amount * 100) / 100,
      count: data.count,
      percentage: total > 0 ? Math.round((data.amount / total) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    total: Math.round(total * 100) / 100,
    essentialTotal: Math.round(essentialTotal * 100) / 100,
    discretionaryTotal: Math.round(discretionaryTotal * 100) / 100,
    essentialRatio: total > 0 ? Math.round((essentialTotal / total) * 10000) / 100 : 0,
    categoryBreakdown,
    classifications,
  };
};

/**
 * Detect if an expense is a spike (significantly higher than average for its category).
 */
export const detectSpike = (expense, historicalExpenses) => {
  const categoryExpenses = historicalExpenses.filter(
    (e) => e.category === expense.category && e._id?.toString() !== expense._id?.toString()
  );

  if (categoryExpenses.length < 3) return { isSpike: false };

  const avg =
    categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length;
  const multiplier = avg > 0 ? expense.amount / avg : 1;

  return {
    isSpike: multiplier > 2,
    multiplier: Math.round(multiplier * 100) / 100,
    categoryAvg: Math.round(avg * 100) / 100,
  };
};
