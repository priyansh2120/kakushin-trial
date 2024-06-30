import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  category: String,
  question: String,
  options: [String],
  correctAnswer: String
});

const responseSchema = new mongoose.Schema({
  userId: String,
  responses: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      selectedAnswer: String,
      isCorrect: Boolean
    }
  ],
  score: Number
});

export const Question = mongoose.model("Question", questionSchema);
export const Response = mongoose.model("Response", responseSchema);