import Nudge from "../../models/nudge.model.js";
import { detectOverspending, detectStreakBreaks, detectCategorySpikes } from "./behaviorAnalyzerService.js";
import { getUserProfile } from "./userProfileService.js";

/**
 * Nudge Engine - Event-driven behavioral nudges.
 * Triggers nudges based on user behavior conditions.
 */

/**
 * Evaluate all nudge conditions for a user and create relevant nudges.
 */
export const evaluateNudges = async (userId) => {
  const [overspending, streakInfo, spikes, profile] = await Promise.all([
    detectOverspending(userId),
    detectStreakBreaks(userId),
    detectCategorySpikes(userId),
    getUserProfile(userId),
  ]);

  const newNudges = [];

  // 1. Overspending alert
  if (overspending.isOverspending) {
    const severity = overspending.spentRatio > 100 ? "critical" : "warning";
    newNudges.push({
      userId,
      type: "overspending_alert",
      severity,
      message: `⚠️ You've already spent ₹${overspending.totalSpent} this month (${overspending.spentRatio}% of budget). With ${overspending.daysRemaining} days left, try to limit daily spending to ₹${Math.round((overspending.budget - overspending.totalSpent) / Math.max(overspending.daysRemaining, 1))}.`,
      data: { spentRatio: overspending.spentRatio, projected: overspending.projectedMonthlySpend },
    });
  }

  // 2. Budget exceeded
  if (overspending.spentRatio > 100) {
    newNudges.push({
      userId,
      type: "budget_exceeded",
      severity: "critical",
      message: `🚨 You've exceeded your monthly budget! Total spent: ₹${overspending.totalSpent}. Focus on essential expenses only for the remaining ${overspending.daysRemaining} days.`,
      data: { totalSpent: overspending.totalSpent },
    });
  }

  // 3. Streak break warning
  if (streakInfo.isStreakAtRisk && !streakInfo.streakBroken) {
    newNudges.push({
      userId,
      type: "streak_break_warning",
      severity: "warning",
      message: `🔥 Your ${streakInfo.currentStreak}-day streak is at risk! Complete a mission today to keep it alive.`,
      data: { currentStreak: streakInfo.currentStreak },
    });
  }

  if (streakInfo.streakBroken) {
    newNudges.push({
      userId,
      type: "streak_break_warning",
      severity: "warning",
      message: `💔 Your streak was broken after ${streakInfo.currentStreak} days. Don't give up — start a new streak today!`,
      data: { daysSinceLastActivity: streakInfo.daysSinceLastActivity },
    });
  }

  // 4. No savings reminder
  if (profile && profile.spendingPatterns?.essentialRatio < 30) {
    newNudges.push({
      userId,
      type: "no_savings_reminder",
      severity: "info",
      message: `💡 Your essential spending is only ${profile.spendingPatterns.essentialRatio}% of total. Consider reviewing your discretionary expenses to boost savings.`,
    });
  }

  // 5. Category spikes
  for (const spike of spikes.slice(0, 2)) {
    newNudges.push({
      userId,
      type: "spending_spike",
      severity: spike.multiplier > 3 ? "critical" : "warning",
      message: `📈 Your ${spike.category} spending is ${spike.multiplier}x higher than usual this week (₹${spike.recentWeeklyTotal}).`,
      data: spike,
    });
  }

  // 6. Goal encouragement
  if (profile?.goals?.targetAmount > 0 && profile?.goals?.currentProgress > 0) {
    const progressPct = Math.round((profile.goals.currentProgress / profile.goals.targetAmount) * 100);
    if (progressPct >= 75) {
      newNudges.push({
        userId,
        type: "goal_encouragement",
        severity: "success",
        message: `🎯 Amazing! You're ${progressPct}% toward your goal of ₹${profile.goals.targetAmount}. You're almost there!`,
        data: { progressPct, targetAmount: profile.goals.targetAmount },
      });
    }
  }

  // 7. Improvement praise
  if (profile?.disciplineScore >= 70) {
    newNudges.push({
      userId,
      type: "improvement_praise",
      severity: "success",
      message: `🌟 Great discipline! Your score is ${profile.disciplineScore}/100. Keep up the excellent financial habits!`,
      data: { disciplineScore: profile.disciplineScore },
    });
  }

  // Save new nudges (avoid duplicates within 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const savedNudges = [];

  for (const nudge of newNudges) {
    const existingRecent = await Nudge.findOne({
      userId,
      type: nudge.type,
      createdAt: { $gte: oneDayAgo },
    });

    if (!existingRecent) {
      const saved = await Nudge.create(nudge);
      savedNudges.push(saved);
    }
  }

  return savedNudges;
};

/**
 * Get unread nudges for a user.
 */
export const getUnreadNudges = async (userId) => {
  return Nudge.find({ userId, read: false })
    .sort({ createdAt: -1 })
    .limit(20);
};

/**
 * Get all recent nudges for a user.
 */
export const getRecentNudges = async (userId, limit = 20) => {
  return Nudge.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Mark nudges as read.
 */
export const markNudgesRead = async (userId, nudgeIds) => {
  if (nudgeIds && nudgeIds.length > 0) {
    await Nudge.updateMany(
      { _id: { $in: nudgeIds }, userId },
      { $set: { read: true } }
    );
  } else {
    await Nudge.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
  }
};

/**
 * Trigger nudge evaluation on specific events.
 */
export const onExpenseAdded = async (userId) => {
  return evaluateNudges(userId);
};
