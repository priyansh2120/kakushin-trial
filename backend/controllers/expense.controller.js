import User from "../models/user.model.js";
import Expense from "../models/expense.model.js";

const updateMonthlySavings = async (userId, amount, date, isIncome = true) => {
  const user = await User.findById(userId);
  const month = date.getMonth() + 1; // Months are zero-indexed
  const year = date.getFullYear();
  const amountToUpdate = isIncome ? amount : -amount;

  // Check if there is already an entry for the specific month and year
  let monthlySavingsEntry = user.monthlySavings.find(
    (saving) => saving.month === month && saving.year === year
  );

  if (monthlySavingsEntry) {
    // Update the existing entry
    monthlySavingsEntry.amount += amountToUpdate;
  } else {
    // Add a new entry
    user.monthlySavings.push({ month, year, amount: amountToUpdate });
  }

  await user.save();
};

export const addExpense = async (req, res) => {
  try {
    const { userId, amount, category, necessityPercentage, description } =
      req.body;
    const date = new Date();

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const expense = new Expense({
      userId,
      amount,
      category,
      necessityPercentage,
      description,
      date,
    });

    await expense.save();

    // Update user's monthly savings
    await updateMonthlySavings(userId, amount, date, false);

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { userId } = req.params;
    const expenses = await Expense.find({ userId });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Update user's monthly savings
    await updateMonthlySavings(
      expense.userId,
      -expense.amount,
      expense.date,
      false
    );

    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, necessityPercentage, description } = req.body;

    // Find the existing expense
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Get the old amount for adjusting the savings
    const oldAmount = expense.amount;

    // Update the expense details
    expense.amount = amount;
    expense.category = category;
    expense.necessityPercentage = necessityPercentage;
    expense.description = description;

    await expense.save();

    const date = new Date(expense.date);
    await updateMonthlySavings(expense.userId, -oldAmount, date, false); // Remove old amount
    await updateMonthlySavings(expense.userId, amount, date, false); // Add new amount

    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
