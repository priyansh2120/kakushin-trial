import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  persona: {
    type: String,
    enum: ["Impulsive", "Balanced", "Saver"],
    default: "Balanced",
  },
  riskLevel: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  baselineScore: {
    type: Number,
    default: 50,
  },
  disciplineScore: {
    type: Number,
    default: 50,
  },
  spendingPatterns: {
    topCategories: { type: [String], default: [] },
    avgDailySpend: { type: Number, default: 0 },
    essentialRatio: { type: Number, default: 0 },
    discretionaryRatio: { type: Number, default: 0 },
  },
  goals: {
    type: { type: String, enum: ["saving", "investing", "budgeting"], default: "saving" },
    targetAmount: { type: Number, default: 0 },
    currentProgress: { type: Number, default: 0 },
    deadline: { type: Date, default: null },
  },
  streakData: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: null },
  },
  weeklyScores: {
    type: [{ week: String, score: Number }],
    default: [],
  },
  lastAnalyzedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

userProfileSchema.index({ userId: 1 });

export default mongoose.model("UserProfile", userProfileSchema);
