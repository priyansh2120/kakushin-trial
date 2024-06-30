import express from 'express';

import { addExpense, deleteExpense, getExpenses, updateExpense } from '../../controllers/expense.controller.js';

const router = express.Router();

router.post('/add', addExpense);
router.get('/:userId', getExpenses);
router.delete('/:id', deleteExpense);
router.put('/:id', updateExpense);

export default router;