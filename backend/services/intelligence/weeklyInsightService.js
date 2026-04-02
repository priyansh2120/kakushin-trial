import Expense from "../../models/expense.model.js";
import Income from "../../models/income.model.js";
import WeeklyInsight from "../../models/weeklyInsight.model.js";
import { computeDisciplineScore } from "./disciplineScoreService.js";

/**
 * Weekly Insight Generator
 * Generates: top spending category, % change vs last week, improvement suggestions.
 */

/**
 * Get the Monday of the week for a given date.
 */
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the Sunday of the week for a given date.
 */
const getWeekEnd = (date) => {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

/**
 * Generate weekly insight for a user.
 */
export const generateWeeklyInsight = async (userId, targetDate = new Date()) => {
  const weekStart = getWeekStart(targetDate);
  const weekEnd = getWeekEnd(targetDate);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  // Check if already generated
  const existing = await WeeklyInsight.findOne({ userId, weekStart: weekStartStr });
  if (existing) return existing;

  // Previous week
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(weekEnd);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

  // Fetch data
  const [currExpenses, prevExpenses, currIncomes] = await Promise.all([
    Expense.find({ userId, date: { $gte: weekStart, $lte: weekEnd } }),
    Expense.find({ userId, date: { $gte: prevWeekStart, $lte: prevWeekEnd } }),
    Income.find({ userId, date: { $gte: weekStart, $lte: weekEnd } }),
  ]);

  const totalSpent = currExpenses.reduce((sum, e) => sum + e.amount, 0);
  const prevTotalSpent = prevExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = currIncomes.reduce((sum, i) => sum + i.amount, 0);

  // Category breakdown
  const categoryMap = {};
  for (const e of currExpenses) {
    const cat = e.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + e.amount;
  }

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategory = categoryBreakdown[0]?.category || null;

  // Week-over-week change
  let spendingChange = 0;
  let direction = "stable";
  if (prevTotalSpent > 0) {
    spendingChange = Math.round(((totalSpent - prevTotalSpent) / prevTotalSpent) * 10000) / 100;
    direction = spendingChange > 5 ? "up" : spendingChange < -5 ? "down" : "stable";
  }

  // Weekday vs weekend patterns
  const weekdayExpenses = currExpenses.filter((e) => {
    const day = new Date(e.date).getDay();
    return day >= 1 && day <= 5;
  });
  const weekendExpenses = currExpenses.filter((e) => {
    const day = new Date(e.date).getDay();
    return day === 0 || day === 6;
  });

  const weekdayTotal = weekdayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const weekendTotal = weekendExpenses.reduce((sum, e) => sum + e.amount, 0);
  const weekdayAvg = weekdayExpenses.length > 0 ? weekdayTotal / 5 : 0;
  const weekendAvg = weekendExpenses.length > 0 ? weekendTotal / 2 : 0;
  const weekendMultiplier = weekdayAvg > 0 ? Math.round((weekendAvg / weekdayAvg) * 100) / 100 : 1;

  // Generate suggestions
  const suggestions = generateSuggestions({
    totalSpent,
    totalIncome,
    categoryBreakdown,
    spendingChange,
    direction,
    weekendMultiplier,
  });

  // Get discipline score
  let score = 50;
  try {
    const scoreResult = await computeDisciplineScore(userId);
    score = scoreResult.total;
  } catch {
    // Use default score if computation fails
  }

  const insight = await WeeklyInsight.findOneAndUpdate(
    { userId, weekStart: weekStartStr },
    {
      $set: {
        weekEnd: weekEndStr,
        totalSpent: Math.round(totalSpent * 100) / 100,
        totalIncome: Math.round(totalIncome * 100) / 100,
        categoryBreakdown,
        topCategory,
        comparedToLastWeek: { spendingChange, direction },
        patterns: {
          weekdayAvg: Math.round(weekdayAvg * 100) / 100,
          weekendAvg: Math.round(weekendAvg * 100) / 100,
          weekendMultiplier,
        },
        suggestions,
        disciplineScore: score,
      },
    },
    { upsert: true, new: true }
  );

  return insight;
};

/**
 * Generate improvement suggestions based on weekly data.
 */
const generateSuggestions = ({ totalSpent, totalIncome, categoryBreakdown, direction, weekendMultiplier }) => {
  const suggestions = [];

  if (direction === "up") {
    suggestions.push("Your spending increased this week. Review your discretionary expenses.");
  } else if (direction === "down") {
    suggestions.push("Great job! Your spending decreased compared to last week. Keep it up!");
  }

  if (weekendMultiplier > 2) {
    suggestions.push(
      `Weekend spending is ${weekendMultiplier}x your weekday average. Consider planning weekend activities in advance.`
    );
  }

  if (totalIncome > 0 && totalSpent > totalIncome * 0.25) {
    suggestions.push("You spent more than 25% of this week's income. Aim for the 50/30/20 rule.");
  }

  // Category-specific suggestions
  for (const cat of categoryBreakdown) {
    if (cat.percentage > 40) {
      suggestions.push(
        `${cat.category} accounts for ${cat.percentage}% of your spending. Consider setting a cap for this category.`
      );
    }
  }

  if (suggestions.length === 0) {
    suggestions.push("Your spending looks balanced this week. Keep maintaining these habits!");
  }

  return suggestions;
};

/**
 * Get recent weekly insights.
 */
export const getRecentInsights = async (userId, limit = 4) => {
  return WeeklyInsight.find({ userId })
    .sort({ weekStart: -1 })
    .limit(limit);
};

/**
 * Get the latest weekly insight (current or most recent).
 */
export const getLatestInsight = async (userId) => {
  // Try to generate for current week first
  const currentInsight = await generateWeeklyInsight(userId);
  return currentInsight;
};
