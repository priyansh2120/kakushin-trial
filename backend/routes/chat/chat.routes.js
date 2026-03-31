import express from "express";
import protectRoute from "../../middleware/protectRoute.js";
import {
  chat,
  getExpenseInsights,
  smartCategorize,
  generateAIQuiz,
  getConversations,
  getConversation,
} from "../../controllers/chat.controller.js";

const router = express.Router();

// All chat routes require authentication
router.post("/message", protectRoute, chat);
router.get("/insights", protectRoute, getExpenseInsights);
router.post("/categorize", protectRoute, smartCategorize);
router.post("/generate-quiz", protectRoute, generateAIQuiz);
router.get("/conversations", protectRoute, getConversations);
router.get("/conversations/:conversationId", protectRoute, getConversation);

export default router;
