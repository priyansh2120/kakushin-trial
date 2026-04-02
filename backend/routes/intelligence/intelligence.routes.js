import express from "express";
import protectRoute from "../../middleware/protectRoute.js";
import {
  getProfile,
  refreshProfile,
  setGoals,
  getDisciplineScore,
  getBehaviorAnalysis,
  getNudges,
  getAllNudges,
  dismissNudges,
  getSpendingProjection,
  getGoalEstimate,
  checkAffordability,
  getWeeklyInsight,
  getInsightHistory,
  getTaxComparison,
  getEPFProjection,
  getTDSAnalysis,
  getFinancialHealthScore,
  getExpenseAnalytics,
  getDashboard,
  getSmartLeaderboard,
} from "../../controllers/intelligence.controller.js";

const router = express.Router();

// User Profile
router.get("/profile", protectRoute, getProfile);
router.post("/profile/refresh", protectRoute, refreshProfile);
router.post("/profile/goals", protectRoute, setGoals);

// Discipline Score
router.get("/score", protectRoute, getDisciplineScore);

// Behavior Analysis
router.get("/behavior", protectRoute, getBehaviorAnalysis);

// Nudges
router.get("/nudges", protectRoute, getNudges);
router.get("/nudges/all", protectRoute, getAllNudges);
router.post("/nudges/dismiss", protectRoute, dismissNudges);

// Predictions
router.get("/predict/spending", protectRoute, getSpendingProjection);
router.post("/predict/goal", protectRoute, getGoalEstimate);
router.post("/predict/afford", protectRoute, checkAffordability);

// Weekly Insights
router.get("/insights/weekly", protectRoute, getWeeklyInsight);
router.get("/insights/history", protectRoute, getInsightHistory);

// Financial Health (Working Professional Lab)
router.post("/finance/tax-compare", protectRoute, getTaxComparison);
router.post("/finance/epf", protectRoute, getEPFProjection);
router.post("/finance/tds", protectRoute, getTDSAnalysis);
router.get("/finance/health", protectRoute, getFinancialHealthScore);

// Expense Analytics
router.get("/analytics/expenses", protectRoute, getExpenseAnalytics);

// Dashboard (combined data)
router.get("/dashboard", protectRoute, getDashboard);

// Smart Leaderboard
router.get("/leaderboard", getSmartLeaderboard);

export default router;
