import Expense from "../../models/expense.model.js";
import Income from "../../models/income.model.js";
import { DailyMissionProgress } from "../../models/mission.model.js";
import UserProfile from "../../models/userProfile.model.js";

/**
 * Discipline Score Engine
 * Computes a composite score from budget adherence, saving consistency,
 * streaks, and improvement over time.
 *
 * score = base - overspending_penalty + saving_bonus + streak_bonus + improvement_factor
 */

const getWeekKey = (date = new Date()) => {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  current.setDate(diff);
  current.setHours(0, 0, 0, 0);
  return current.toISOString().split("T")[0];
};

/**
 * Compute budget adherence score (0-30 points).
 */
const computeBudgetAdherence = async (userId) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthExpenses, monthIncomes] = await Promise.all([
    Expense.find({ userId, date: { $gte: monthStart } }),
    Income.find({ userId, date: { $gte: monthStart } }),
  ]);

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0);

  if (totalIncome === 0) return 15; // neutral if no income logged

  const spendRatio = totalSpent / totalIncome;

  // Under budget: full points. Over budget: penalty.
  if (spendRatio <= 0.5) return 30;
  if (spendRatio <= 0.7) return 25;
  if (spendRatio <= 0.85) return 20;
  if (spendRatio <= 1.0) return 15;
  if (spendRatio <= 1.2) return 8;
  return 0;
};

/**
 * Compute saving consistency score (0-25 points).
 */
const computeSavingConsistency = async (userId) => {
  const user = (await import("../../models/user.model.js")).default;
  const userData = await user.findById(userId).select("monthlySavings");

  if (!userData || !userData.monthlySavings || userData.monthlySavings.length === 0) {
    return 10;
  }

  const recentMonths = userData.monthlySavings.slice(-3);
  const positiveSavingsCount = recentMonths.filter((m) => m.amount > 0).length;

  // Reward consistent positive savings
  if (positiveSavingsCount === 3) return 25;
  if (positiveSavingsCount === 2) return 18;
  if (positiveSavingsCount === 1) return 10;
  return 3;
};

/**
 * Compute streak bonus (0-20 points).
 */
const computeStreakBonus = async (userId) => {
  const progress = await DailyMissionProgress.find({ userId })
    .sort({ date: -1 })
    .limit(1);

  const currentStreak = progress[0]?.streak || 0;

  if (currentStreak >= 30) return 20;
  if (currentStreak >= 14) return 16;
  if (currentStreak >= 7) return 12;
  if (currentStreak >= 3) return 8;
  if (currentStreak >= 1) return 4;
  return 0;
};

/**
 * Compute improvement factor (0-25 points).
 * Compares current week's spending control to previous weeks.
 */
const computeImprovementFactor = async (userId) => {
  const now = new Date();
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);

  const [prevWeekExpenses, currWeekExpenses] = await Promise.all([
    Expense.find({ userId, date: { $gte: twoWeeksAgo, $lt: oneWeekAgo } }),
    Expense.find({ userId, date: { $gte: oneWeekAgo } }),
  ]);

  const prevTotal = prevWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
  const currTotal = currWeekExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (prevTotal === 0) return 12; // neutral

  const change = (prevTotal - currTotal) / prevTotal;

  // Reward spending reduction
  if (change >= 0.2) return 25; // 20%+ reduction
  if (change >= 0.1) return 20;
  if (change >= 0) return 15; // maintained or slight reduction
  if (change >= -0.1) return 10; // slight increase
  if (change >= -0.2) return 5;
  return 0; // significant increase
};

/**
 * Compute full discipline score (0-100).
 */
export const computeDisciplineScore = async (userId) => {
  const [budgetScore, savingsScore, streakScore, improvementScore] = await Promise.all([
    computeBudgetAdherence(userId),
    computeSavingConsistency(userId),
    computeStreakBonus(userId),
    computeImprovementFactor(userId),
  ]);

  const total = budgetScore + savingsScore + streakScore + improvementScore;
  const clampedScore = Math.min(100, Math.max(0, total));
  const weekKey = getWeekKey();
  const existingProfile = await UserProfile.findOne({ userId }).select("weeklyScores");
  const existingWeeklyScores = existingProfile?.weeklyScores || [];
  const updatedWeeklyScores = [
    ...existingWeeklyScores.filter((entry) => entry.week !== weekKey),
    { week: weekKey, score: clampedScore },
  ].slice(-12);

  // Persist to user profile
  await UserProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        disciplineScore: clampedScore,
        weeklyScores: updatedWeeklyScores,
      },
    },
    { upsert: true }
  );

  return {
    total: clampedScore,
    breakdown: {
      budgetAdherence: { score: budgetScore, max: 30 },
      savingConsistency: { score: savingsScore, max: 25 },
      streak: { score: streakScore, max: 20 },
      improvement: { score: improvementScore, max: 25 },
    },
    grade: getGrade(clampedScore),
  };
};

const getGrade = (score) => {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
};
