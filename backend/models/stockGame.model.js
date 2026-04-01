import mongoose from "mongoose";

const portfolioItemSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  shares: { type: Number, default: 0 },
  avgBuyPrice: { type: Number, default: 0 },
});

const transactionSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  type: { type: String, enum: ["buy", "sell"], required: true },
  shares: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const stockGameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  cashBalance: {
    type: Number,
    default: 100000, // Start with ₹1,00,000 virtual cash
  },
  portfolio: [portfolioItemSchema],
  transactions: [transactionSchema],
  totalPortfolioValue: {
    type: Number,
    default: 100000,
  },
  profitLoss: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

stockGameSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("StockGame", stockGameSchema);

// Virtual stock market data
export const STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries", basePrice: 2450, volatility: 0.03 },
  { symbol: "TCS", name: "Tata Consultancy Services", basePrice: 3800, volatility: 0.02 },
  { symbol: "INFY", name: "Infosys", basePrice: 1550, volatility: 0.025 },
  { symbol: "HDFCBANK", name: "HDFC Bank", basePrice: 1680, volatility: 0.02 },
  { symbol: "ICICIBANK", name: "ICICI Bank", basePrice: 1120, volatility: 0.025 },
  { symbol: "WIPRO", name: "Wipro", basePrice: 480, volatility: 0.03 },
  { symbol: "SBIN", name: "State Bank of India", basePrice: 780, volatility: 0.035 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", basePrice: 1450, volatility: 0.02 },
  { symbol: "ITC", name: "ITC Limited", basePrice: 440, volatility: 0.015 },
  { symbol: "TATASTEEL", name: "Tata Steel", basePrice: 165, volatility: 0.04 },
];

// Generate simulated price with some randomness but trend
export const getSimulatedPrice = (stock) => {
  const now = Date.now();
  const daysSinceEpoch = now / (1000 * 60 * 60 * 24);

  // Create a deterministic but varying price using sin waves
  const trend = Math.sin(daysSinceEpoch * 0.1 + stock.symbol.length) * stock.volatility;
  const noise = Math.sin(daysSinceEpoch * 2.3 + stock.symbol.charCodeAt(0)) * stock.volatility * 0.5;
  const hourlyVariation = Math.sin((now / (1000 * 60 * 60)) + stock.symbol.charCodeAt(1)) * stock.volatility * 0.3;

  const multiplier = 1 + trend + noise + hourlyVariation;
  const price = stock.basePrice * multiplier;

  return Math.round(price * 100) / 100;
};
