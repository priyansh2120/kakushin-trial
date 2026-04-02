import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth/auth.routes.js";
import quizRoutes from "./routes/quiz/quiz.routes.js";
import expenseRoutes from "./routes/expenseTracker/expense.routes.js";
import incomeRoutes from "./routes/expenseTracker/income.routes.js";
import choreRoutes from "./routes/choresManagement/chores.routes.js";
import extrasRoutes from "./routes/extras/user.routes.js";
import chatRoutes from "./routes/chat/chat.routes.js";
import missionRoutes from "./routes/missions/mission.routes.js";
import gameRoutes from "./routes/games/game.routes.js";
import careerLabRoutes from "./routes/careerLab/careerLab.routes.js";
import cors from "cors";
import User from "./models/user.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

if (!process.env.DB_URI) {
  console.error(
    "Missing DB_URI. Add it to backend/.env (MongoDB connection string)."
  );
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 8080;

// CRA dev server may be opened as localhost, 127.0.0.1, ::1, or another port.
const defaultDevOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://[::1]:3000",
];
const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim()).filter(Boolean)
  : [];
const allowedOrigins = [...new Set([...defaultDevOrigins, ...envOrigins])];

const isProduction = process.env.NODE_ENV === "production";

app.use(express.json());
app.use(cookieParser());
if (!isProduction) {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}
app.use(
  cors({
    // In development, reflect any Origin so all local URLs work (avoids CORS mismatches).
    // In production, only allow CLIENT_URL / defaultDevOrigins.
    origin: isProduction ? allowedOrigins : true,
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
app.use("/api/missions", missionRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/career-lab", careerLabRoutes);

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

function indexGone(err) {
  return (
    err?.code === 27 ||
    err?.codeName === "IndexNotFound" ||
    /not find.*index/i.test(String(err?.message))
  );
}

async function ensureUserIndexes() {
  for (const name of ["email_1", "username_1"]) {
    try {
      await User.collection.dropIndex(name);
      console.log(`Dropped legacy index ${name}`);
    } catch (err) {
      if (!indexGone(err)) console.warn(`ensureUserIndexes drop ${name}:`, err.message);
    }
  }

  await User.collection.updateMany({ email: null }, { $unset: { email: "" } });

  const removed = await User.deleteMany({
    $or: [
      { username: null },
      { username: "" },
      { username: { $exists: false } },
    ],
  });
  if (removed.deletedCount > 0) {
    console.log(
      `Removed ${removed.deletedCount} user(s) with invalid username (needed for unique index)`
    );
  }

  await User.syncIndexes();
}

mongoose
  .connect(process.env.DB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    await ensureUserIndexes();
    app.listen(port, () => {
      console.log(`SmartLit API listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
