import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth/auth.routes.js";
import quizRoutes from "./routes/quiz/quiz.routes.js";
import expenseRoutes from "./routes/expenseTracker/expense.routes.js";
import incomeRoutes from "./routes/expenseTracker/income.routes.js";
import choreRoutes from "./routes/choresManagement/chores.routes.js";
import extrasRoutes from "./routes/extras/user.routes.js";
import chatRoutes from "./routes/chat/chat.routes.js";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
  : ["http://localhost:3000"];

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/chore", choreRoutes);
app.use("/api/extras", extrasRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "SmartLit API is running",
    version: "2.0.0",
    aiAgents: [
      "Financial Advisor",
      "Expense Analyzer",
      "Smart Categorizer",
      "Quiz Generator",
    ],
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong" });
});

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`SmartLit API listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
