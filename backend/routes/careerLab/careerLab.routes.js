import express from "express";
import protectRoute from "../../middleware/protectRoute.js";
import {
  getCareerLabAttempts,
  submitCareerLabAttempt,
} from "../../controllers/careerLab.controller.js";

const router = express.Router();

router.get("/attempts", protectRoute, getCareerLabAttempts);
router.post("/attempts", protectRoute, submitCareerLabAttempt);

export default router;
