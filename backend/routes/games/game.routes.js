import express from "express";
import protectRoute from "../../middleware/protectRoute.js";
import {
  getMarketData,
  getPortfolio,
  buyStock,
  sellStock,
  budgetChallenge,
  getStockLeaderboard,
} from "../../controllers/game.controller.js";

const router = express.Router();

router.get("/stocks/market", protectRoute, getMarketData);
router.get("/stocks/portfolio", protectRoute, getPortfolio);
router.post("/stocks/buy", protectRoute, buyStock);
router.post("/stocks/sell", protectRoute, sellStock);
router.post("/budget-challenge", protectRoute, budgetChallenge);
router.get("/stocks/leaderboard", getStockLeaderboard);

export default router;
