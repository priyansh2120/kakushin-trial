import express from 'express';

import { addExpense, deleteExpense, getExpenses, updateExpense, getLeadeboard } from '../../controllers/expense.controller.js';
import protectRoute from '../../middleware/protectRoute.js';

const router = express.Router();

router.post('/add', protectRoute, addExpense);
router.get('/get/leaderboard', getLeadeboard);
router.get('/:userId', protectRoute, getExpenses);
router.delete('/:id', protectRoute, deleteExpense);
router.put('/:id', protectRoute, updateExpense);

export default router;