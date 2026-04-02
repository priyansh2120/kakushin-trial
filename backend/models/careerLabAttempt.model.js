import mongoose from "mongoose";

const rubricItemSchema = new mongoose.Schema(
  {
    criterion: { type: String, required: true },
    score: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    moduleId: {
      type: String,
      required: true,
      index: true,
    },
    professionSnapshot: {
      type: String,
      default: "Job",
    },
    attemptData: {
      scenarioSummary: { type: String, required: true },
      chosenActions: { type: String, required: true },
      checksPerformed: { type: String, required: true },
      finalDecision: { type: String, required: true },
    },
    aiEvaluation: {
      summary: { type: String, required: true },
      strengths: { type: [String], default: [] },
      mistakes: { type: [String], default: [] },
      recommendedNextSteps: { type: [String], default: [] },
      rubricBreakdown: { type: [rubricItemSchema], default: [] },
    },
    overallScore: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CareerLabAttempt", attemptSchema);
