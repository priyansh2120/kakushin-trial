import express from "express";

import { quizQuestions, submitQuiz } from "../../controllers/quiz.controller.js";
import protectRoute from "../../middleware/protectRoute.js";

const router = express.Router();

router.get("/questions",protectRoute ,quizQuestions);
router.post("/submit", protectRoute, submitQuiz);


export default router;