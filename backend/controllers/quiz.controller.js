import {Question, Response} from '../models/quiz.model.js';
import User from '../models/user.model.js';

export const quizQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
export const submitQuiz = async (req, res) => {
  app.post('/api/quiz/submit', async (req, res) => {
    const { responses, username} = req.body;
    let score = 0;
  
    const evaluatedResponses = await Promise.all(
      Object.keys(responses).map(async questionId => {
        const question = await Question.findById(questionId);
        const isCorrect = question.correctAnswer === responses[questionId];
        if (isCorrect) score += 1;
        return {
          questionId,
          selectedAnswer: responses[questionId],
          isCorrect
        };
      })
    );
  
    const userResponse = new Response({
      username,
      responses: evaluatedResponses,
      score
    });
  
    await userResponse.save();

    const user = await User.findById(username);
    user.financialLiteracy += score;
    await user.save();

    res.json({ score });
  });
}

