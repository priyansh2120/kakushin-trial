import express from "express";

import { quizQuestions, submitQuiz } from "../../controllers/quiz.controller.js";
import protectRoute from "../../middleware/protectRoute.js";

const router = express.Router();

router.get("/questions" ,quizQuestions);
router.post("/submit", submitQuiz);


export default router;