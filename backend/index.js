import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth/auth.routes.js";
import quizRoutes from "./routes/quiz/quiz.routes.js";
import cors from "cors";


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));



app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);


app.get("/", (req, res) => {
  res.send("Hello World!");
});


mongoose.connect(process.env.DB_URI).then(() => {
  console.log("connected to mongodb on", process.env.DB_URI);
  app.listen(port, () => {
    console.log(` listening on port ${port}`);
  });
});
