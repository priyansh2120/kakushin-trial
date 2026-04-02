import Expense from "../../models/expense.model.js";
import Income from "../../models/income.model.js";
import { DailyMissionProgress } from "../../models/mission.model.js";

/**
 * Behavior Analyzer Service
 * Detects overspending patterns, category spikes, streak breaks.
 * Outputs structured behavioral insights.
 */

/**
 * Detect overspending: current period spending vs income or budget.
 */
export const detectOverspending = async (userId) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthExpenses, monthIncomes] = await Promise.all([
    Expense.find({ userId, date: { $gte: monthStart } }),
    Income.find({ userId, date: { $gte: monthStart } }),
  ]);

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
  const budget = totalIncome > 0 ? totalIncome : 30000; // fallback budget

  const spentRatio = totalSpent / budget;
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const expectedRatio = dayOfMonth / daysInMonth;

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    budget: Math.round(budget * 100) / 100,
    spentRatio: Math.round(spentRatio * 10000) / 100,
    expectedRatio: Math.round(expectedRatio * 10000) / 100,
    isOverspending: spentRatio > expectedRatio * 1.2,
    overspendingAmount: spentRatio > expectedRatio
      ? Math.round((totalSpent - budget * expectedRatio) * 100) / 100
      : 0,
    projectedMonthlySpend: Math.round((totalSpent / Math.max(dayOfMonth, 1)) * daysInMonth * 100) / 100,
    daysRemaining: daysInMonth - dayOfMonth,
  };
};

/**
 * Detect category spikes: compare recent spending per category vs historical average.
 */
export const detectCategorySpikes = async (userId) => {
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - 7);

  const previousMonthStart = new Date(now);
  previousMonthStart.setMonth(now.getMonth() - 1);

  const [recentExpenses, historicalExpenses] = await Promise.all([
    Expense.find({ userId, date: { $gte: currentWeekStart } }),
    Expense.find({ userId, date: { $gte: previousMonthStart, $lt: currentWeekStart } }),
  ]);

  // Build category averages from history
  const historicalDays = Math.max(1,
    Math.ceil((currentWeekStart - previousMonthStart) / (1000 * 60 * 60 * 24)));
  const historicalByCategory = {};
  for (const e of historicalExpenses) {
    if (!historicalByCategory[e.category]) historicalByCategory[e.category] = 0;
    historicalByCategory[e.category] += e.amount;
  }

  // Compare recent week vs historical daily average
  const spikes = [];
  const recentByCategory = {};
  for (const e of recentExpenses) {
    if (!recentByCategory[e.category]) recentByCategory[e.category] = 0;
    recentByCategory[e.category] += e.amount;
  }

  for (const [category, recentTotal] of Object.entries(recentByCategory)) {
    const historicalTotal = historicalByCategory[category] || 0;
    const dailyAvg = historicalTotal / historicalDays;
    const recentDailyAvg = recentTotal / 7;

    if (dailyAvg > 0 && recentDailyAvg > dailyAvg * 1.5) {
      spikes.push({
        category,
        recentWeeklyTotal: Math.round(recentTotal * 100) / 100,
        historicalDailyAvg: Math.round(dailyAvg * 100) / 100,
        multiplier: Math.round((recentDailyAvg / dailyAvg) * 100) / 100,
      });
    }
  }

  return spikes.sort((a, b) => b.multiplier - a.multiplier);
};

/**
 * Detect streak breaks: days without activity.
 */
export const detectStreakBreaks = async (userId) => {
  const progress = await DailyMissionProgress.find({ userId })
    .sort({ date: -1 })
    .limit(7);

  const today = new Date().toISOString().split("T")[0];
  const hasActivityToday = progress.some((p) => p.date === today);

  let daysSinceLastActivity = 0;
  if (progress.length > 0) {
    const lastDate = new Date(progress[0].date);
    const diff = Math.ceil((new Date() - lastDate) / (1000 * 60 * 60 * 24));
    daysSinceLastActivity = diff;
  }

  const currentStreak = progress[0]?.streak || 0;

  // Check for recent expense activity as well
  const recentExpense = await Expense.findOne({ userId }).sort({ date: -1 });
  let daysSinceLastExpense = 0;
  if (recentExpense) {
    daysSinceLastExpense = Math.ceil(
      (new Date() - new Date(recentExpense.date)) / (1000 * 60 * 60 * 24)
    );
  }

  return {
    hasActivityToday,
    daysSinceLastActivity,
    daysSinceLastExpense,
    currentStreak,
    isStreakAtRisk: daysSinceLastActivity >= 1 && currentStreak > 0,
    streakBroken: daysSinceLastActivity >= 2,
  };
};

/**
 * Generate comprehensive behavioral analysis.
 */
export const getFullBehaviorAnalysis = async (userId) => {
  const [overspending, spikes, streakInfo] = await Promise.all([
    detectOverspending(userId),
    detectCategorySpikes(userId),
    detectStreakBreaks(userId),
  ]);

  const insights = [];

  if (overspending.isOverspending) {
    insights.push({
      type: "overspending",
      severity: overspending.spentRatio > 100 ? "critical" : "warning",
      message: `You've spent ₹${overspending.totalSpent} this month, which is ${overspending.spentRatio}% of your budget. At this rate, you'll spend ₹${overspending.projectedMonthlySpend} by month end.`,
    });
  }

  for (const spike of spikes) {
    insights.push({
      type: "category_spike",
      severity: spike.multiplier > 3 ? "critical" : "warning",
      message: `Your ${spike.category} spending is ${spike.multiplier}x higher than your average this week.`,
      data: spike,
    });
  }

  if (streakInfo.streakBroken) {
    insights.push({
      type: "streak_break",
      severity: "warning",
      message: `Your activity streak was broken! It's been ${streakInfo.daysSinceLastActivity} days since your last activity.`,
    });
  } else if (streakInfo.isStreakAtRisk) {
    insights.push({
      type: "streak_risk",
      severity: "info",
      message: `Your ${streakInfo.currentStreak}-day streak is at risk! Complete a mission today to keep it going.`,
    });
  }

  if (streakInfo.daysSinceLastExpense > 3) {
    insights.push({
      type: "no_tracking",
      severity: "info",
      message: `You haven't logged an expense in ${streakInfo.daysSinceLastExpense} days. Tracking helps build awareness!`,
    });
  }

  return {
    overspending,
    spikes,
    streakInfo,
    insights,
    analyzedAt: new Date().toISOString(),
  };
};
