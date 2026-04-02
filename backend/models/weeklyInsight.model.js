import mongoose from "mongoose";

const weeklyInsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  weekStart: {
    type: String, // ISO date string for Monday of the week
    required: true,
  },
  weekEnd: {
    type: String,
    required: true,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  totalIncome: {
    type: Number,
    default: 0,
  },
  categoryBreakdown: {
    type: [{ category: String, amount: Number, percentage: Number }],
    default: [],
  },
  topCategory: {
    type: String,
    default: null,
  },
  comparedToLastWeek: {
    spendingChange: { type: Number, default: 0 }, // percentage change
    direction: { type: String, enum: ["up", "down", "stable"], default: "stable" },
  },
  patterns: {
    weekdayAvg: { type: Number, default: 0 },
    weekendAvg: { type: Number, default: 0 },
    weekendMultiplier: { type: Number, default: 1 },
  },
  suggestions: {
    type: [String],
    default: [],
  },
  disciplineScore: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

weeklyInsightSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

export default mongoose.model("WeeklyInsight", weeklyInsightSchema);
