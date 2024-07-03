import express from 'express';

import { addExpense, deleteExpense, getExpenses, updateExpense, getLeadeboard } from '../../controllers/expense.controller.js';

const router = express.Router();

router.post('/add', addExpense);
router.get('/:userId', getExpenses);
router.delete('/:id', deleteExpense);
router.put('/:id', updateExpense);
router.get('/get/leaderboard', getLeadeboard);
export default router;