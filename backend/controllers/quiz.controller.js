import { Question, Response } from "../models/quiz.model.js";
import User from "../models/user.model.js";

export const quizQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { userId, score, results } = req.body;

    if (!userId || score === undefined) {
      return res.status(400).json({ error: "userId and score are required" });
    }

    const curruser = await User.findById(userId);
    if (!curruser) {
      return res.status(404).json({ error: "User not found" });
    }

    curruser.financialLiteracy += score;
    curruser.virtualCurrency += score * 2;
    await curruser.save();

    // Save the quiz response
    const quizResponse = new Response({
      userId,
      responses: results || [],
      score,
    });
    await quizResponse.save();

    res.json({
      message: "Results submitted successfully",
      financialLiteracy: curruser.financialLiteracy,
      virtualCurrency: curruser.virtualCurrency,
    });
  } catch (error) {
    console.error("Quiz submit error:", error);
    res.status(500).json({ error: "Failed to submit quiz results" });
  }
};
