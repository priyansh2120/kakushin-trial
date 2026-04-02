import {
  DailyMissionProgress,
  DAILY_MISSIONS,
} from "../models/mission.model.js";
import User from "../models/user.model.js";
import Expense from "../models/expense.model.js";
import Income from "../models/income.model.js";
import Chore from "../models/chore.model.js";
import Conversation from "../models/conversation.model.js";
import { Response } from "../models/quiz.model.js";
import mongoose from "mongoose";

const getTodayString = () => {
  return new Date().toISOString().split("T")[0];
};

const getTodayRange = () => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
};

const getObjectIdRange = ({ start, end }) => ({
  $gte: mongoose.Types.ObjectId.createFromTime(
    Math.floor(start.getTime() / 1000)
  ),
  $lt: mongoose.Types.ObjectId.createFromTime(Math.floor(end.getTime() / 1000)),
});

const getMissionEligibility = async (userId, missionKey, todayRange) => {
  switch (missionKey) {
    case "log_expense": {
      const count = await Expense.countDocuments({
        userId,
        date: { $gte: todayRange.start, $lt: todayRange.end },
      });
      return {
        eligible: count > 0,
        reason:
          count > 0
            ? "Expense tracked today"
            : "Add at least one expense today to unlock this claim",
      };
    }

    case "log_income": {
      const count = await Income.countDocuments({
        userId,
        date: { $gte: todayRange.start, $lt: todayRange.end },
      });
      return {
        eligible: count > 0,
        reason:
          count > 0
            ? "Income recorded today"
            : "Add an income entry today to unlock this claim",
      };
    }

    case "complete_quiz": {
      const count = await Response.countDocuments({
        userId: String(userId),
        _id: getObjectIdRange(todayRange),
      });
      return {
        eligible: count > 0,
        reason:
          count > 0
            ? "Quiz completed today"
            : "Finish a quiz today to unlock this claim",
      };
    }

    case "chat_ai": {
      const count = await Conversation.countDocuments({
        userId,
        messages: {
          $elemMatch: {
            role: "user",
            timestamp: { $gte: todayRange.start, $lt: todayRange.end },
          },
        },
      });
      return {
        eligible: count > 0,
        reason:
          count > 0
            ? "AI chat used today"
            : "Send at least one AI message today to unlock this claim",
      };
    }

    case "complete_chore": {
      const count = await Chore.countDocuments({
        userId,
        isCompleted: true,
        dateCompleted: { $gte: todayRange.start, $lt: todayRange.end },
      });
      return {
        eligible: count > 0,
        reason:
          count > 0
            ? "Chore completed today"
            : "Complete at least one chore today to unlock this claim",
      };
    }

    default:
      return { eligible: false, reason: "Unknown mission" };
  }
};

// Get daily missions with completion status
export const getDailyMissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getTodayString();
    const todayRange = getTodayRange();

    let progress = await DailyMissionProgress.findOne({ userId, date: today });

    if (!progress) {
      // Check yesterday for streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const yesterdayProgress = await DailyMissionProgress.findOne({
        userId,
        date: yesterdayStr,
      });

      const streak = yesterdayProgress ? yesterdayProgress.streak : 0;

      progress = new DailyMissionProgress({
        userId,
        date: today,
        completedMissions: [],
        streak,
      });
      await progress.save();
    }

    const missions = await Promise.all(DAILY_MISSIONS.map(async (mission) => {
      const completed = progress.completedMissions.find(
        (cm) => cm.missionKey === mission.key
      );
      const eligibility = completed
        ? {
            eligible: false,
            reason: "Already claimed today",
          }
        : await getMissionEligibility(userId, mission.key, todayRange);
      return {
        ...mission,
        completed: !!completed,
        completedAt: completed?.completedAt || null,
        canClaim: !completed && eligibility.eligible,
        eligibilityReason: completed
          ? "Already claimed today"
          : eligibility.reason,
      };
    }));

    const completedCount = progress.completedMissions.length;
    const totalMissions = DAILY_MISSIONS.length;

    res.json({
      date: today,
      missions,
      streak: progress.streak,
      completedCount,
      totalMissions,
      allCompleted: completedCount >= totalMissions,
      streakBonus:
        completedCount >= totalMissions
          ? Math.min(progress.streak * 2, 20)
          : 0,
    });
  } catch (error) {
    console.error("Get daily missions error:", error);
    res.status(500).json({ error: "Failed to fetch daily missions" });
  }
};

// Complete a daily mission
export const completeMission = async (req, res) => {
  try {
    const userId = req.user._id;
    const { missionKey } = req.body;
    const today = getTodayString();
    const todayRange = getTodayRange();

    const mission = DAILY_MISSIONS.find((m) => m.key === missionKey);
    if (!mission) {
      return res.status(400).json({ error: "Invalid mission key" });
    }

    let progress = await DailyMissionProgress.findOne({ userId, date: today });
    if (!progress) {
      progress = new DailyMissionProgress({
        userId,
        date: today,
        completedMissions: [],
        streak: 0,
      });
    }

    // Check if already completed
    const alreadyCompleted = progress.completedMissions.find(
      (cm) => cm.missionKey === missionKey
    );
    if (alreadyCompleted) {
      return res
        .status(400)
        .json({ error: "Mission already completed today" });
    }

    const eligibility = await getMissionEligibility(
      userId,
      missionKey,
      todayRange
    );
    if (!eligibility.eligible) {
      return res.status(400).json({
        error: eligibility.reason,
        missionKey,
      });
    }

    // Mark as completed
    progress.completedMissions.push({
      missionKey,
      completedAt: new Date(),
      rewardClaimed: true,
    });

    // Award virtual currency
    const user = await User.findById(userId);
    user.virtualCurrency += mission.reward;

    // Check if all missions completed - award streak bonus
    if (progress.completedMissions.length >= DAILY_MISSIONS.length) {
      progress.streak += 1;
      const streakBonus = Math.min(progress.streak * 2, 20);
      user.virtualCurrency += streakBonus;
    }

    await progress.save();
    await user.save();

    res.json({
      success: true,
      missionKey,
      reward: mission.reward,
      newBalance: user.virtualCurrency,
      streak: progress.streak,
      completedCount: progress.completedMissions.length,
      totalMissions: DAILY_MISSIONS.length,
    });
  } catch (error) {
    console.error("Complete mission error:", error);
    res.status(500).json({ error: "Failed to complete mission" });
  }
};
