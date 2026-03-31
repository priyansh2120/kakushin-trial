import {
  DailyMissionProgress,
  DAILY_MISSIONS,
} from "../models/mission.model.js";
import User from "../models/user.model.js";

const getTodayString = () => {
  return new Date().toISOString().split("T")[0];
};

// Get daily missions with completion status
export const getDailyMissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getTodayString();

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

    const missions = DAILY_MISSIONS.map((mission) => {
      const completed = progress.completedMissions.find(
        (cm) => cm.missionKey === mission.key
      );
      return {
        ...mission,
        completed: !!completed,
        completedAt: completed?.completedAt || null,
      };
    });

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
