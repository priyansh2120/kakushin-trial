import mongoose from "mongoose";

const nudgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "overspending_alert",
      "streak_break_warning",
      "no_savings_reminder",
      "goal_encouragement",
      "spending_spike",
      "weekly_summary",
      "budget_exceeded",
      "improvement_praise",
    ],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ["info", "warning", "critical", "success"],
    default: "info",
  },
  read: {
    type: Boolean,
    default: false,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, { timestamps: true });

nudgeSchema.index({ userId: 1, read: 1 });
nudgeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 day TTL

export default mongoose.model("Nudge", nudgeSchema);
