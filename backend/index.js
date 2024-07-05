import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth/auth.routes.js";
import quizRoutes from "./routes/quiz/quiz.routes.js";
import expenseRoutes from "./routes/expenseTracker/expense.routes.js";
import incomeRoutes from "./routes/expenseTracker/income.routes.js";
import choreRoutes from "./routes/choresManagement/chores.routes.js"
import extrasRoutes from "./routes/extras/user.routes.js"
import chatRoutes from "./routes/chat/chat.routes.js"
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/chore", choreRoutes);
app.use("/api/extras", extrasRoutes)
app.use("/api/chat", chatRoutes)

app.get("/", (req, res) => {
  res.send("Hello World!");
});

mongoose.connect(process.env.DB_URI).then(() => {
  console.log("connected to mongodb on", process.env.DB_URI);
  app.listen(port, () => {
    console.log(` listening on port ${port}`);
  });
});
