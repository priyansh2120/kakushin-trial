import CareerLabAttempt from "../models/careerLabAttempt.model.js";
import User from "../models/user.model.js";
import { evaluateCareerLabAttempt } from "../services/ai/agents/careerLabEvaluator.js";

const validateAttemptData = (attemptData) => {
  if (!attemptData || typeof attemptData !== "object") {
    return "Attempt data is required";
  }

  const requiredFields = [
    "scenarioSummary",
    "chosenActions",
    "checksPerformed",
    "finalDecision",
  ];

  for (const field of requiredFields) {
    if (!attemptData[field] || !String(attemptData[field]).trim()) {
      return `${field} is required`;
    }
  }

  return null;
};

export const submitCareerLabAttempt = async (req, res) => {
  try {
    const userId = req.user._id;
    const { moduleId, attemptData } = req.body;

    if (!moduleId) {
      return res.status(400).json({ error: "moduleId is required" });
    }

    const validationError = validateAttemptData(attemptData);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.profession !== "Job") {
      return res.status(403).json({ error: "Career lab is available only for Job users" });
    }

    const evaluation = await evaluateCareerLabAttempt({
      moduleId,
      attemptData,
      userProfile: user,
    });

    const attempt = await CareerLabAttempt.create({
      userId,
      moduleId,
      professionSnapshot: user.profession,
      attemptData,
      aiEvaluation: {
        summary: evaluation.summary,
        strengths: evaluation.strengths || [],
        mistakes: evaluation.mistakes || [],
        recommendedNextSteps: evaluation.recommendedNextSteps || [],
        rubricBreakdown: evaluation.rubricBreakdown || [],
      },
      overallScore: evaluation.overallScore,
      grade: evaluation.grade,
    });

    user.virtualCurrency += Math.max(2, Math.round((evaluation.overallScore || 50) / 20));
    await user.save();

    res.json({
      attemptId: attempt._id,
      overallScore: attempt.overallScore,
      grade: attempt.grade,
      aiEvaluation: attempt.aiEvaluation,
      createdAt: attempt.createdAt,
      newBalance: user.virtualCurrency,
    });
  } catch (error) {
    console.error("Submit career lab attempt error:", error);
    res.status(500).json({ error: "Failed to evaluate career lab attempt" });
  }
};

export const getCareerLabAttempts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { moduleId } = req.query;

    const query = { userId };
    if (moduleId) {
      query.moduleId = moduleId;
    }

    const attempts = await CareerLabAttempt.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(attempts);
  } catch (error) {
    console.error("Get career lab attempts error:", error);
    res.status(500).json({ error: "Failed to fetch career lab attempts" });
  }
};
