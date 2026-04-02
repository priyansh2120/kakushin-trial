import Expense from "../../models/expense.model.js";
import Income from "../../models/income.model.js";

/**
 * Prediction Module (Lightweight)
 * Uses simple statistical methods — no heavy ML.
 * Estimates monthly spending and goal completion probability.
 */

/**
 * Project monthly spending based on current pace.
 */
export const projectMonthlySpending = async (userId) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const [monthExpenses, monthIncomes] = await Promise.all([
    Expense.find({ userId, date: { $gte: monthStart } }),
    Income.find({ userId, date: { $gte: monthStart } }),
  ]);

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
  const avgDailySpend = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;
  const remainingDays = daysInMonth - dayOfMonth;
  const projectedTotal = totalSpent + avgDailySpend * remainingDays;
  const budget = totalIncome > 0 ? totalIncome : 30000;

  const willExceedBudget = projectedTotal > budget;
  const exceedAmount = willExceedBudget ? Math.round((projectedTotal - budget) * 100) / 100 : 0;
  const dailyBudgetRemaining = remainingDays > 0
    ? Math.round(((budget - totalSpent) / remainingDays) * 100) / 100
    : 0;

  return {
    currentSpent: Math.round(totalSpent * 100) / 100,
    avgDailySpend: Math.round(avgDailySpend * 100) / 100,
    projectedMonthlySpend: Math.round(projectedTotal * 100) / 100,
    budget: Math.round(budget * 100) / 100,
    remainingDays,
    willExceedBudget,
    exceedAmount,
    dailyBudgetRemaining: Math.max(0, dailyBudgetRemaining),
    savingsProjection: Math.round((budget - projectedTotal) * 100) / 100,
    message: willExceedBudget
      ? `⚠️ You may exceed your budget by ₹${exceedAmount}. Try limiting daily spending to ₹${dailyBudgetRemaining}.`
      : `✅ On track! Projected savings: ₹${Math.round((budget - projectedTotal) * 100) / 100}. Keep it up!`,
  };
};

/**
 * Estimate goal completion probability.
 */
export const estimateGoalCompletion = async (userId, targetAmount, deadlineDate) => {
  const user = (await import("../../models/user.model.js")).default;
  const userData = await user.findById(userId).select("monthlySavings");

  // Calculate average monthly savings from history
  const monthlySavings = userData?.monthlySavings || [];
  const recentSavings = monthlySavings.slice(-6);

  if (recentSavings.length === 0) {
    return {
      probability: 0.3,
      monthsNeeded: null,
      message: "Not enough data to estimate. Start tracking income and expenses!",
      avgMonthlySavings: 0,
    };
  }

  const avgMonthlySavings =
    recentSavings.reduce((sum, m) => sum + Math.max(0, m.amount), 0) / recentSavings.length;

  if (avgMonthlySavings <= 0) {
    return {
      probability: 0.1,
      monthsNeeded: null,
      message: "Your recent savings are negative. Focus on reducing expenses first.",
      avgMonthlySavings: 0,
    };
  }

  const monthsNeeded = Math.ceil(targetAmount / avgMonthlySavings);
  const deadline = deadlineDate ? new Date(deadlineDate) : null;

  let probability;
  let message;

  if (deadline) {
    const monthsUntilDeadline = Math.max(
      0,
      (deadline.getFullYear() - new Date().getFullYear()) * 12 +
        deadline.getMonth() -
        new Date().getMonth()
    );

    probability = Math.min(1, monthsUntilDeadline / monthsNeeded);

    if (probability >= 0.9) {
      message = `🎯 Excellent! At your current savings rate of ₹${Math.round(avgMonthlySavings)}/month, you'll reach your goal well within the deadline.`;
    } else if (probability >= 0.6) {
      message = `📊 Achievable! You need to save ₹${Math.round(targetAmount / monthsUntilDeadline)}/month to hit your goal on time.`;
    } else {
      message = `⚠️ Challenging. At current rate, you need ${monthsNeeded} months but only have ${monthsUntilDeadline} left. Consider increasing savings by ₹${Math.round(targetAmount / monthsUntilDeadline - avgMonthlySavings)}/month.`;
    }
  } else {
    probability = avgMonthlySavings > 0 ? 0.7 : 0.2;
    message = `At ₹${Math.round(avgMonthlySavings)}/month, you'll reach ₹${targetAmount} in approximately ${monthsNeeded} months.`;
  }

  return {
    probability: Math.round(probability * 100) / 100,
    monthsNeeded,
    avgMonthlySavings: Math.round(avgMonthlySavings * 100) / 100,
    message,
  };
};

/**
 * "Can I afford X?" simulation.
 */
export const canAfford = async (userId, itemCost) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthExpenses, monthIncomes] = await Promise.all([
    Expense.find({ userId, date: { $gte: monthStart } }),
    Income.find({ userId, date: { $gte: monthStart } }),
  ]);

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
  const budget = totalIncome > 0 ? totalIncome : 30000;
  const remaining = budget - totalSpent;
  const canAffordNow = remaining >= itemCost;

  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - dayOfMonth;
  const dailyBudgetAfterPurchase = remainingDays > 0
    ? Math.round(((remaining - itemCost) / remainingDays) * 100) / 100
    : 0;

  // Calculate impact on savings
  const user = (await import("../../models/user.model.js")).default;
  const userData = await user.findById(userId).select("monthlySavings");
  const recentSavings = (userData?.monthlySavings || []).slice(-3);
  const avgMonthlySavings =
    recentSavings.length > 0
      ? recentSavings.reduce((sum, m) => sum + m.amount, 0) / recentSavings.length
      : 0;

  const savingsImpact = avgMonthlySavings > 0
    ? Math.round((itemCost / avgMonthlySavings) * 100) / 100
    : 0;

  // Days to save for it
  const avgDailySavings = avgMonthlySavings / 30;
  const daysToSave = avgDailySavings > 0 ? Math.ceil(itemCost / avgDailySavings) : null;

  let verdict;
  if (canAffordNow && dailyBudgetAfterPurchase > 0) {
    verdict = `✅ Yes, you can afford ₹${itemCost}. Your remaining daily budget would be ₹${dailyBudgetAfterPurchase}.`;
  } else if (canAffordNow) {
    verdict = `⚠️ Technically possible, but it would use up your remaining budget for the month. Consider waiting.`;
  } else {
    verdict = `❌ Not recommended right now. You'd be ₹${Math.round(itemCost - remaining)} over budget. ${daysToSave ? `Save for ${daysToSave} more days.` : ""}`;
  }

  return {
    canAffordNow,
    remainingBudget: Math.round(remaining * 100) / 100,
    dailyBudgetAfterPurchase: Math.max(0, dailyBudgetAfterPurchase),
    savingsImpactMonths: savingsImpact,
    daysToSave,
    verdict,
    itemCost,
  };
};
