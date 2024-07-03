import { Question, Response } from "../models/quiz.model.js";
import User from "../models/user.model.js";

export const quizQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.send(questions);
    console.log("here");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
export const submitQuiz = async (req, res) => {
  const results = req.body;

  // Example: Logging results to console (you can process and store these results as needed)
  console.log("Received quiz results:", results.score);
  const userId = results.userId;
  // console.log(userId);
  const curruser = await User.findById(userId);
  
  curruser.score += results.score;
  curruser.save();


  // Response back to the client
  res.json({ message: "Results submitted successfully", results });
};
