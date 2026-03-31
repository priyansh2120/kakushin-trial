import express from "express";
const router = express.Router();

import { addIncome, getIncomes, deleteIncome, updateIncome } from "../../controllers/income.controller.js";
import protectRoute from "../../middleware/protectRoute.js";

router.post("/add", protectRoute, addIncome);
router.get("/:userId", protectRoute, getIncomes);
router.delete("/:id", protectRoute, deleteIncome);
router.put("/:id", protectRoute, updateIncome);

export default router;
