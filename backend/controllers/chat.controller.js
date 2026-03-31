import { processQuery } from "../services/ai/orchestrator.js";
import { analyzeExpenses } from "../services/ai/agents/expenseAnalyzer.js";
import { categorizeExpense } from "../services/ai/agents/smartCategorizer.js";
import { generateQuiz } from "../services/ai/agents/quizGenerator.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import Expense from "../models/expense.model.js";
import Income from "../models/income.model.js";

// Build user context for AI agents
const buildUserContext = async (userId) => {
  const user = await User.findById(userId).select("-password -parentSecretKey");
  const expenses = await Expense.find({ userId })
    .sort({ date: -1 })
    .limit(50);
  const incomes = await Income.find({ userId }).sort({ date: -1 }).limit(20);

  return {
    user,
    expenses,
    incomes,
    monthlySavings: user?.monthlySavings || [],
  };
};

// Main chat endpoint - routes through AI orchestrator
export const chat = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build context from user's financial data
    const userContext = await buildUserContext(userId);

    // Process through AI orchestrator
    const aiResult = await processQuery(message, userContext);

    // Save to conversation history
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }
    if (!conversation) {
      conversation = new Conversation({
        userId,
        title:
          message.length > 50 ? message.substring(0, 50) + "..." : message,
      });
    }

    // Add user message
    conversation.messages.push({
      role: "user",
      content: message,
    });

    // Add assistant response
    const responseContent =
      typeof aiResult.response === "object"
        ? JSON.stringify(aiResult.response)
        : aiResult.response;

    conversation.messages.push({
      role: "assistant",
      content:
        typeof aiResult.response === "string"
          ? aiResult.response
          : "Here's your analysis:",
      agent: aiResult.agent,
      isStructured: aiResult.isStructured,
      structuredData: aiResult.isStructured ? aiResult.response : null,
    });

    await conversation.save();

    // Award virtual currency for using AI features
    const user = await User.findById(userId);
    user.virtualCurrency += 2;
    await user.save();

    res.json({
      conversationId: conversation._id,
      agent: aiResult.agent,
      confidence: aiResult.confidence,
      response: aiResult.response,
      isStructured: aiResult.isStructured,
      virtualCurrencyEarned: 2,
    });
  } catch (error) {
    console.error("Chat controller error:", error);
    res.status(500).json({ error: "Failed to process your message. " + error.message });
  }
};

// Get AI expense analysis
export const getExpenseInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const userContext = await buildUserContext(userId);

    const analysis = await analyzeExpenses(
      userContext.expenses,
      userContext.incomes,
      userContext.user
    );

    res.json(analysis);
  } catch (error) {
    console.error("Expense insights error:", error);
    res.status(500).json({ error: "Failed to analyze expenses" });
  }
};

// Smart categorize an expense
export const smartCategorize = async (req, res) => {
  try {
    const { description, amount } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    const categorization = await categorizeExpense(
      description,
      amount || 0
    );

    res.json(categorization);
  } catch (error) {
    console.error("Smart categorize error:", error);
    res.status(500).json({ error: "Failed to categorize expense" });
  }
};

// Generate AI quiz questions
export const generateAIQuiz = async (req, res) => {
  try {
    const userId = req.user._id;
    const { topic, numQuestions } = req.body;

    const user = await User.findById(userId).select("-password");
    const quiz = await generateQuiz(user, numQuestions || 5, topic);

    // Award points for taking AI quizzes
    user.virtualCurrency += 3;
    await user.save();

    res.json(quiz);
  } catch (error) {
    console.error("AI Quiz generation error:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
};

// Get conversation history
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({ userId })
      .select("title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(20);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

// Get a specific conversation
export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};
