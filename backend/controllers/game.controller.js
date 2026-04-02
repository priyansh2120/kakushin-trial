import StockGame from "../models/stockGame.model.js";
import User from "../models/user.model.js";
import { generateStructuredResponse } from "../services/ai/geminiClient.js";
import {
  getMarketDataStatus,
  getMarketStockBySymbol,
  getMarketStocks,
  refreshMarketStocksIfNeeded,
} from "../services/marketData/stockMarketService.js";

// Get stock market data backed by daily snapshots plus intraday simulation.
export const getMarketData = async (req, res) => {
  try {
    const [marketData, status] = await Promise.all([
      getMarketStocks(),
      getMarketDataStatus(),
    ]);

    res.json(
      marketData.map((stock) => ({
        ...stock,
        marketDataProvider: status.provider,
        marketLastRefreshedAt: status.lastRefreshedAt,
      }))
    );
  } catch (error) {
    console.error("Market data error:", error);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
};

// Get user's portfolio
export const getPortfolio = async (req, res) => {
  try {
    const userId = req.user._id;

    let game = await StockGame.findOne({ userId });
    if (!game) {
      game = new StockGame({ userId });
      await game.save();
    }

    const marketStocks = await getMarketStocks();
    const stockMap = new Map(marketStocks.map((stock) => [stock.symbol, stock]));

    // Calculate current portfolio value
    let totalValue = game.cashBalance;
    const holdings = game.portfolio.map((item) => {
      const stock = stockMap.get(item.symbol);
      const currentPrice = stock ? stock.price : item.avgBuyPrice;
      const value = item.shares * currentPrice;
      const pl = (currentPrice - item.avgBuyPrice) * item.shares;
      totalValue += value;

      return {
        symbol: item.symbol,
        name: item.name,
        shares: item.shares,
        avgBuyPrice: item.avgBuyPrice,
        currentPrice,
        value: Math.round(value * 100) / 100,
        profitLoss: Math.round(pl * 100) / 100,
        profitLossPercent:
          item.avgBuyPrice > 0
            ? Math.round(
                ((currentPrice - item.avgBuyPrice) / item.avgBuyPrice) *
                  10000
              ) / 100
            : 0,
      };
    });

    game.totalPortfolioValue = Math.round(totalValue * 100) / 100;
    game.profitLoss = Math.round((totalValue - 100000) * 100) / 100;
    await game.save();

    res.json({
      cashBalance: game.cashBalance,
      holdings,
      totalPortfolioValue: game.totalPortfolioValue,
      profitLoss: game.profitLoss,
      profitLossPercent: Math.round((game.profitLoss / 100000) * 10000) / 100,
      transactions: game.transactions.slice(-20).reverse(),
    });
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
};

// Buy stock
export const buyStock = async (req, res) => {
  try {
    const userId = req.user._id;
    const { symbol, shares } = req.body;

    if (!symbol || !shares || shares <= 0) {
      return res.status(400).json({ error: "Invalid symbol or shares" });
    }

    const stock = await getMarketStockBySymbol(symbol);
    if (!stock) {
      return res.status(400).json({ error: "Stock not found" });
    }

    const currentPrice = stock.price;
    const totalCost = currentPrice * shares;

    let game = await StockGame.findOne({ userId });
    if (!game) {
      game = new StockGame({ userId });
    }

    if (game.cashBalance < totalCost) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    // Deduct cash
    game.cashBalance = Math.round((game.cashBalance - totalCost) * 100) / 100;

    // Update or add to portfolio
    const existing = game.portfolio.find((p) => p.symbol === symbol);
    if (existing) {
      const totalShares = existing.shares + shares;
      existing.avgBuyPrice =
        (existing.avgBuyPrice * existing.shares + currentPrice * shares) /
        totalShares;
      existing.shares = totalShares;
    } else {
      game.portfolio.push({
        symbol,
        name: stock.name,
        shares,
        avgBuyPrice: currentPrice,
      });
    }

    // Record transaction
    game.transactions.push({
      symbol,
      type: "buy",
      shares,
      price: currentPrice,
      total: totalCost,
    });

    await game.save();

    // Award virtual currency for trading
    const user = await User.findById(userId);
    user.virtualCurrency += 3;
    await user.save();

    res.json({
      success: true,
      message: `Bought ${shares} shares of ${symbol} at ₹${currentPrice}`,
      cashBalance: game.cashBalance,
      virtualCurrencyEarned: 3,
    });
  } catch (error) {
    console.error("Buy stock error:", error);
    res.status(500).json({ error: "Failed to buy stock" });
  }
};

// Sell stock
export const sellStock = async (req, res) => {
  try {
    const userId = req.user._id;
    const { symbol, shares } = req.body;

    if (!symbol || !shares || shares <= 0) {
      return res.status(400).json({ error: "Invalid symbol or shares" });
    }

    const stock = await getMarketStockBySymbol(symbol);
    if (!stock) {
      return res.status(400).json({ error: "Stock not found" });
    }

    let game = await StockGame.findOne({ userId });
    if (!game) {
      return res.status(400).json({ error: "No portfolio found" });
    }

    const holding = game.portfolio.find((p) => p.symbol === symbol);
    if (!holding || holding.shares < shares) {
      return res.status(400).json({ error: "Insufficient shares" });
    }

    const currentPrice = stock.price;
    const totalValue = currentPrice * shares;

    // Add cash
    game.cashBalance = Math.round((game.cashBalance + totalValue) * 100) / 100;

    // Update portfolio
    holding.shares -= shares;
    if (holding.shares === 0) {
      game.portfolio = game.portfolio.filter((p) => p.symbol !== symbol);
    }

    // Record transaction
    game.transactions.push({
      symbol,
      type: "sell",
      shares,
      price: currentPrice,
      total: totalValue,
    });

    await game.save();

    // Award virtual currency
    const user = await User.findById(userId);
    user.virtualCurrency += 3;
    await user.save();

    res.json({
      success: true,
      message: `Sold ${shares} shares of ${symbol} at ₹${currentPrice}`,
      cashBalance: game.cashBalance,
      virtualCurrencyEarned: 3,
    });
  } catch (error) {
    console.error("Sell stock error:", error);
    res.status(500).json({ error: "Failed to sell stock" });
  }
};

// Budget Challenge - AI evaluated
export const budgetChallenge = async (req, res) => {
  try {
    const { allocation, scenario } = req.body;
    const userId = req.user._id;

    const defaultScenario = `You are a 22-year-old starting your first job in Pune with a monthly salary of ₹30,000.
Allocate your budget across: Rent, Food, Transport, Entertainment, Savings, Education, Health, Emergency Fund.`;

    const prompt = `Evaluate this budget allocation for the scenario:
${scenario || defaultScenario}

User's allocation (in ₹):
${Object.entries(allocation)
  .map(([category, amount]) => `- ${category}: ₹${amount}`)
  .join("\n")}
Total: ₹${Object.values(allocation).reduce((sum, a) => sum + Number(a), 0)}

Return JSON:
{
  "overallScore": number (0-100),
  "grade": "A+" | "A" | "B+" | "B" | "C" | "D" | "F",
  "feedback": string (2-3 sentences overall feedback),
  "categoryFeedback": [{ "category": string, "score": number, "emoji": string, "comment": string }],
  "tips": [string],
  "coinsEarned": number (based on score: score/10 rounded)
}`;

    const evaluation = await generateStructuredResponse(
      prompt,
      "You are a financial education expert evaluating budget allocations. Be encouraging but honest. Score based on the 50/30/20 rule (50% needs, 30% wants, 20% savings) adapted for Indian context."
    );

    // Award coins based on score
    const coinsEarned = Math.round((evaluation.overallScore || 50) / 10);
    const user = await User.findById(userId);
    user.virtualCurrency += coinsEarned;
    await user.save();

    res.json({
      ...evaluation,
      coinsEarned,
      newBalance: user.virtualCurrency,
    });
  } catch (error) {
    console.error("Budget challenge error:", error);
    res.status(500).json({ error: "Failed to evaluate budget" });
  }
};

// Get stock game leaderboard
export const getStockLeaderboard = async (req, res) => {
  try {
    const games = await StockGame.find().populate("userId", "username name profilePictureUrl");

    const leaderboard = games
      .filter((g) => g.userId)
      .map((game) => ({
        username: game.userId.username,
        name: game.userId.name,
        profilePictureUrl: game.userId.profilePictureUrl,
        totalValue: game.totalPortfolioValue,
        profitLoss: game.profitLoss,
        profitLossPercent:
          Math.round((game.profitLoss / 100000) * 10000) / 100,
        holdingsCount: game.portfolio.length,
      }))
      .sort((a, b) => b.totalValue - a.totalValue);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

export const refreshStockMarketData = async (_req, res) => {
  try {
    await refreshMarketStocksIfNeeded({ force: true });
    const status = await getMarketDataStatus();
    res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("Refresh stock market data error:", error);
    res.status(500).json({ error: "Failed to refresh stock market data" });
  }
};
