import { buildUserProfile, getUserProfile, updateUserGoals } from "../services/intelligence/userProfileService.js";
import { computeDisciplineScore } from "../services/intelligence/disciplineScoreService.js";
import { getFullBehaviorAnalysis } from "../services/intelligence/behaviorAnalyzerService.js";
import { evaluateNudges, getUnreadNudges, getRecentNudges, markNudgesRead } from "../services/intelligence/nudgeService.js";
import { projectMonthlySpending, estimateGoalCompletion, canAfford } from "../services/intelligence/predictionService.js";
import { generateWeeklyInsight, getRecentInsights, getLatestInsight } from "../services/intelligence/weeklyInsightService.js";
import { compareTaxRegimes, computeEPFProjection, analyzeTDS, computeFinancialHealth } from "../services/intelligence/financialHealthService.js";
import { analyzeExpenseBatch } from "../services/intelligence/expenseIntelligenceService.js";
import Expense from "../models/expense.model.js";

// ─── User Profile ───────────────────────────────────────────────

export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await getUserProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

export const refreshProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await buildUserProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error("Refresh profile error:", error);
    res.status(500).json({ error: "Failed to refresh user profile" });
  }
};

export const setGoals = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, targetAmount, deadline } = req.body;

    if (!type || !targetAmount) {
      return res.status(400).json({ error: "Goal type and target amount are required" });
    }

    const profile = await updateUserGoals(userId, {
      type,
      targetAmount: Number(targetAmount),
      currentProgress: 0,
      deadline: deadline ? new Date(deadline) : null,
    });

    res.json(profile);
  } catch (error) {
    console.error("Set goals error:", error);
    res.status(500).json({ error: "Failed to set goals" });
  }
};

// ─── Discipline Score ───────────────────────────────────────────

export const getDisciplineScore = async (req, res) => {
  try {
    const userId = req.user._id;
    const score = await computeDisciplineScore(userId);
    res.json(score);
  } catch (error) {
    console.error("Discipline score error:", error);
    res.status(500).json({ error: "Failed to compute discipline score" });
  }
};

// ─── Behavior Analysis ─────────────────────────────────────────

export const getBehaviorAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;
    const analysis = await getFullBehaviorAnalysis(userId);
    res.json(analysis);
  } catch (error) {
    console.error("Behavior analysis error:", error);
    res.status(500).json({ error: "Failed to analyze behavior" });
  }
};

// ─── Nudges ─────────────────────────────────────────────────────

export const getNudges = async (req, res) => {
  try {
    const userId = req.user._id;
    // Evaluate new nudges then return unread
    await evaluateNudges(userId);
    const nudges = await getUnreadNudges(userId);
    res.json(nudges);
  } catch (error) {
    console.error("Get nudges error:", error);
    res.status(500).json({ error: "Failed to fetch nudges" });
  }
};

export const getAllNudges = async (req, res) => {
  try {
    const userId = req.user._id;
    const nudges = await getRecentNudges(userId, 50);
    res.json(nudges);
  } catch (error) {
    console.error("Get all nudges error:", error);
    res.status(500).json({ error: "Failed to fetch nudges" });
  }
};

export const dismissNudges = async (req, res) => {
  try {
    const userId = req.user._id;
    const { nudgeIds } = req.body;
    await markNudgesRead(userId, nudgeIds);
    res.json({ success: true });
  } catch (error) {
    console.error("Dismiss nudges error:", error);
    res.status(500).json({ error: "Failed to dismiss nudges" });
  }
};

// ─── Predictions ────────────────────────────────────────────────

export const getSpendingProjection = async (req, res) => {
  try {
    const userId = req.user._id;
    const projection = await projectMonthlySpending(userId);
    res.json(projection);
  } catch (error) {
    console.error("Spending projection error:", error);
    res.status(500).json({ error: "Failed to project spending" });
  }
};

export const getGoalEstimate = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetAmount, deadline } = req.body;

    if (!targetAmount) {
      return res.status(400).json({ error: "Target amount is required" });
    }

    const estimate = await estimateGoalCompletion(userId, Number(targetAmount), deadline);
    res.json(estimate);
  } catch (error) {
    console.error("Goal estimate error:", error);
    res.status(500).json({ error: "Failed to estimate goal" });
  }
};

export const checkAffordability = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    const result = await canAfford(userId, Number(amount));
    res.json(result);
  } catch (error) {
    console.error("Affordability check error:", error);
    res.status(500).json({ error: "Failed to check affordability" });
  }
};

// ─── Weekly Insights ────────────────────────────────────────────

export const getWeeklyInsight = async (req, res) => {
  try {
    const userId = req.user._id;
    const insight = await getLatestInsight(userId);
    res.json(insight);
  } catch (error) {
    console.error("Weekly insight error:", error);
    res.status(500).json({ error: "Failed to generate weekly insight" });
  }
};

export const getInsightHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const insights = await getRecentInsights(userId, 8);
    res.json(insights);
  } catch (error) {
    console.error("Insight history error:", error);
    res.status(500).json({ error: "Failed to fetch insight history" });
  }
};

// ─── Financial Health (Working Professional Lab) ────────────────

export const getTaxComparison = async (req, res) => {
  try {
    const { annualIncome, deductions } = req.body;

    if (!annualIncome) {
      return res.status(400).json({ error: "Annual income is required" });
    }

    const result = compareTaxRegimes(Number(annualIncome), deductions || {});
    res.json(result);
  } catch (error) {
    console.error("Tax comparison error:", error);
    res.status(500).json({ error: "Failed to compare tax regimes" });
  }
};

export const getEPFProjection = async (req, res) => {
  try {
    const { monthlySalary, currentAge, retirementAge } = req.body;

    if (!monthlySalary || !currentAge) {
      return res.status(400).json({ error: "Monthly salary and current age are required" });
    }

    const result = computeEPFProjection(
      Number(monthlySalary),
      Number(currentAge),
      Number(retirementAge) || 60
    );
    res.json(result);
  } catch (error) {
    console.error("EPF projection error:", error);
    res.status(500).json({ error: "Failed to compute EPF projection" });
  }
};

export const getTDSAnalysis = async (req, res) => {
  try {
    const { annualIncome, tdsDeducted } = req.body;

    if (!annualIncome || tdsDeducted === undefined) {
      return res.status(400).json({ error: "Annual income and TDS deducted are required" });
    }

    const result = analyzeTDS(Number(annualIncome), Number(tdsDeducted));
    res.json(result);
  } catch (error) {
    console.error("TDS analysis error:", error);
    res.status(500).json({ error: "Failed to analyze TDS" });
  }
};

export const getFinancialHealthScore = async (req, res) => {
  try {
    const userId = req.user._id;
    const health = await computeFinancialHealth(userId);
    res.json(health);
  } catch (error) {
    console.error("Financial health error:", error);
    res.status(500).json({ error: "Failed to compute financial health" });
  }
};

// ─── Expense Analytics ──────────────────────────────────────────

export const getExpenseAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days } = req.query;
    const daysBack = Number(days) || 30;

    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const expenses = await Expense.find({ userId, date: { $gte: since } });
    const analytics = analyzeExpenseBatch(expenses);
    res.json(analytics);
  } catch (error) {
    console.error("Expense analytics error:", error);
    res.status(500).json({ error: "Failed to analyze expenses" });
  }
};

// ─── Dashboard (Combined data for home page) ───────────────────

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [profile, score, nudges, projection, insight] = await Promise.all([
      getUserProfile(userId),
      computeDisciplineScore(userId),
      getUnreadNudges(userId),
      projectMonthlySpending(userId),
      getLatestInsight(userId),
    ]);

    res.json({
      profile,
      disciplineScore: score,
      nudges,
      projection,
      weeklyInsight: insight,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};

// ─── Smart Leaderboard ─────────────────────────────────────────

export const getSmartLeaderboard = async (req, res) => {
  try {
    const User = (await import("../models/user.model.js")).default;
    const UserProfile = (await import("../models/userProfile.model.js")).default;

    const users = await User.find().select("username name profilePictureUrl profession financialLiteracy virtualCurrency");
    const profiles = await UserProfile.find();

    const profileMap = {};
    for (const p of profiles) {
      profileMap[p.userId.toString()] = p;
    }

    const leaderboard = users.map((user) => {
      const profile = profileMap[user._id.toString()];
      const disciplineScore = profile?.disciplineScore || 0;
      const streak = profile?.streakData?.currentStreak || 0;

      // Improvement: compare recent weekly scores
      const weeklyScores = profile?.weeklyScores || [];
      let improvement = 0;
      if (weeklyScores.length >= 2) {
        const recent = weeklyScores[weeklyScores.length - 1]?.score || 0;
        const previous = weeklyScores[weeklyScores.length - 2]?.score || 0;
        improvement = previous > 0 ? Math.round(((recent - previous) / previous) * 100) : 0;
      }

      // Composite rank score
      // MAX_STREAK_CAP: 30 days is the maximum streak that contributes to ranking,
      // preventing long-tenured users from having an insurmountable advantage.
      const MAX_STREAK_CAP = 30;
      const consistency = Math.min(streak, MAX_STREAK_CAP) / MAX_STREAK_CAP;
      const rankScore =
        disciplineScore * 0.5 +
        consistency * 30 +
        Math.max(0, improvement) * 0.2;

      return {
        _id: user._id,
        username: user.username,
        name: user.name,
        profilePictureUrl: user.profilePictureUrl,
        profession: user.profession,
        financialLiteracy: user.financialLiteracy,
        virtualCurrency: user.virtualCurrency,
        disciplineScore,
        streak,
        improvement,
        rankScore: Math.round(rankScore * 100) / 100,
      };
    });

    leaderboard.sort((a, b) => b.rankScore - a.rankScore);

    res.json(leaderboard);
  } catch (error) {
    console.error("Smart leaderboard error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};
