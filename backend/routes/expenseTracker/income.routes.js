import express from "express";
const router = express.Router();

import { addIncome, getIncomes, deleteIncome, updateIncome } from "../../controllers/income.controller.js";

router.post("/add", addIncome);
router.get("/:userId", getIncomes);
router.delete("/:id", deleteIncome);
router.put("/:id", updateIncome);


export default router;
