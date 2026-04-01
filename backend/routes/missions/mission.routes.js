import express from "express";
import protectRoute from "../../middleware/protectRoute.js";
import {
  getDailyMissions,
  completeMission,
} from "../../controllers/mission.controller.js";

const router = express.Router();

router.get("/daily", protectRoute, getDailyMissions);
router.post("/complete", protectRoute, completeMission);

export default router;
