import {Question, Response} from '../models/quiz.model.js';
import User from '../models/user.model.js';

export const quizQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.send(questions);
    console.log("here");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
export const submitQuiz = async (req, res) => {
  const { responses, username } = req.body;
  let score = 0;

  const evaluatedResponses = await Promise.all(
    Object.keys(responses).map(async questionId => {
      // Find question by its position (index in array)
      const question = await Question.findById(questionId); // Assuming questionId is a valid ObjectId
      if (!question) {
        return {
          questionId,
          selectedAnswer: responses[questionId],
          isCorrect: false  // Handle case where question is not found
        };
      }

      // Check if selected answer matches correctAnswer
      const isCorrect = question.correctAnswer === responses[questionId];
      if (isCorrect) score += 1;

      return {
        questionId,
        selectedAnswer: responses[questionId],
        isCorrect
      };
    })
  );

  // Save user response with score
  const userResponse = new Response({
    userId: username, // Ensure your schema matches the userId field name
    responses: evaluatedResponses,
    score
  });

  await userResponse.save();

  // Update user's financial literacy score
  const user = await User.findById(username);
  if (user) {
    user.financialLiteracy += score;
    await user.save();
  }

  res.json({ score });
};
