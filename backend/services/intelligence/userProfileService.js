import UserProfile from "../../models/userProfile.model.js";
import Expense from "../../models/expense.model.js";
import Income from "../../models/income.model.js";
import { DailyMissionProgress } from "../../models/mission.model.js";

/**
 * Classify user persona based on spending behavior.
 * Uses rule-based logic: ratio of discretionary vs essential spending.
 */
const classifyPersona = (expenses) => {
  if (!expenses || expenses.length === 0) return "Balanced";

  const avgNecessity =
    expenses.reduce((sum, e) => sum + (e.necessityPercentage || 50), 0) / expenses.length;

  if (avgNecessity < 40) return "Impulsive";
  if (avgNecessity > 70) return "Saver";
  return "Balanced";
};

/**
 * Assess risk level from income, spending, and saving patterns.
 */
const assessRiskLevel = (user, expenses, incomes) => {
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (totalIncome === 0) return "Medium";

  const savingsRate = (totalIncome - totalExpense) / totalIncome;
  if (savingsRate < 0.1) return "High";
  if (savingsRate > 0.3) return "Low";
  return "Medium";
};

/**
 * Compute baseline score from user behavior data.
 */
const computeBaselineScore = (expenses) => {
  if (!expenses || expenses.length === 0) return 50;

  const avgNecessity =
    expenses.reduce((sum, e) => sum + (e.necessityPercentage || 50), 0) / expenses.length;
  // Scale 0-100 necessity to 30-70 baseline
  return Math.round(30 + (avgNecessity / 100) * 40);
};

/**
 * Identify top spending categories.
 */
const getTopCategories = (expenses) => {
  const categoryMap = {};
  for (const e of expenses) {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  }
  return Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat]) => cat);
};

/**
 * Compute average daily spend from recent expenses.
 */
const computeAvgDailySpend = (expenses) => {
  if (!expenses || expenses.length === 0) return 0;

  const sorted = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstDate = new Date(sorted[0].date);
  const lastDate = new Date(sorted[sorted.length - 1].date);
  const daySpan = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return Math.round((totalSpent / daySpan) * 100) / 100;
};

/**
 * Get streak data from mission progress.
 */
const getStreakData = async (userId) => {
  const progress = await DailyMissionProgress.find({ userId })
    .sort({ date: -1 })
    .limit(30);

  if (!progress || progress.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
  }

  return {
    currentStreak: progress[0]?.streak || 0,
    longestStreak: Math.max(...progress.map((p) => p.streak || 0)),
    lastActiveDate: progress[0]?.date || null,
  };
};

/**
 * Build or update the user profile from behavioral data.
 */
export const buildUserProfile = async (userId) => {
  const [expenses, incomes, user] = await Promise.all([
    Expense.find({ userId }).sort({ date: -1 }).limit(100),
    Income.find({ userId }).sort({ date: -1 }).limit(50),
    (await import("../../models/user.model.js")).default.findById(userId),
  ]);

  if (!user) throw new Error("User not found");

  const persona = classifyPersona(expenses);
  const riskLevel = assessRiskLevel(user, expenses, incomes);
  const baselineScore = computeBaselineScore(expenses);
  const topCategories = getTopCategories(expenses);
  const avgDailySpend = computeAvgDailySpend(expenses);
  const streakData = await getStreakData(userId);

  const totalEssential = expenses
    .filter((e) => (e.necessityPercentage || 0) >= 60)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const essentialRatio = totalSpent > 0 ? Math.round((totalEssential / totalSpent) * 100) : 0;

  const profileData = {
    userId,
    persona,
    riskLevel,
    baselineScore,
    spendingPatterns: {
      topCategories,
      avgDailySpend,
      essentialRatio,
      discretionaryRatio: 100 - essentialRatio,
    },
    streakData,
    lastAnalyzedAt: new Date(),
  };

  const profile = await UserProfile.findOneAndUpdate(
    { userId },
    { $set: profileData },
    { upsert: true, new: true }
  );

  return profile;
};

/**
 * Get or create user profile.
 */
export const getUserProfile = async (userId) => {
  let profile = await UserProfile.findOne({ userId });
  if (!profile) {
    profile = await buildUserProfile(userId);
  }
  return profile;
};

/**
 * Update user goals.
 */
export const updateUserGoals = async (userId, goals) => {
  const profile = await UserProfile.findOneAndUpdate(
    { userId },
    { $set: { goals } },
    { upsert: true, new: true }
  );
  return profile;
};
