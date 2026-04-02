import mongoose from "mongoose";

const marketStockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  alphaSymbol: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  exchange: {
    type: String,
    default: "BSE",
  },
  sector: {
    type: String,
    default: "Diversified",
  },
  marketCapBand: {
    type: String,
    default: "large_cap",
  },
  baseVolatility: {
    type: Number,
    default: 0.02,
  },
  description: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    required: true,
  },
  previousClose: {
    type: Number,
    required: true,
  },
  open: {
    type: Number,
    default: 0,
  },
  high: {
    type: Number,
    default: 0,
  },
  low: {
    type: Number,
    default: 0,
  },
  volume: {
    type: Number,
    default: 0,
  },
  change: {
    type: Number,
    default: 0,
  },
  changePercent: {
    type: Number,
    default: 0,
  },
  source: {
    type: String,
    default: "seeded-simulation",
  },
  lastRefreshedAt: {
    type: Date,
    default: Date.now,
  },
  refreshStatus: {
    type: String,
    default: "seeded",
  },
}, {
  timestamps: true,
});

export default mongoose.model("MarketStock", marketStockSchema);
