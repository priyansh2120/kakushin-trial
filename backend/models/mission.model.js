import mongoose from "mongoose";

const missionSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  reward: {
    type: Number,
    required: true,
  },
  icon: {
    type: String,
    default: "⭐",
  },
});

const dailyMissionProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  completedMissions: [
    {
      missionKey: String,
      completedAt: { type: Date, default: Date.now },
      rewardClaimed: { type: Boolean, default: false },
    },
  ],
  streak: {
    type: Number,
    default: 0,
  },
});

dailyMissionProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyMissionProgress = mongoose.model(
  "DailyMissionProgress",
  dailyMissionProgressSchema
);

// Default daily missions
export const DAILY_MISSIONS = [
  {
    key: "log_expense",
    title: "Track an Expense",
    description: "Log at least one expense today",
    reward: 5,
    icon: "💰",
  },
  {
    key: "log_income",
    title: "Record Income",
    description: "Log an income entry today",
    reward: 5,
    icon: "💵",
  },
  {
    key: "complete_quiz",
    title: "Quiz Time",
    description: "Complete a financial literacy quiz",
    reward: 10,
    icon: "🧠",
  },
  {
    key: "chat_ai",
    title: "Ask the AI",
    description: "Chat with the AI financial advisor",
    reward: 5,
    icon: "🤖",
  },
  {
    key: "complete_chore",
    title: "Chore Champion",
    description: "Complete at least one chore",
    reward: 8,
    icon: "✅",
  },
];
