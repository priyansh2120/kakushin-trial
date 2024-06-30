import express from "express";
import User from "../models/user.model.js";
import Income from "../models/income.model.js";

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

export const addIncome = async (req, res) => {
  try {
    const { userId, amount, source, description } = req.body;
    const date = new Date();

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const income = new Income({
      userId,
      amount,
      source,
      description,
    });

    await income.save();

    // Update user's monthly savings
    await updateMonthlySavings(userId, amount, date, true);

    res.status(201).json(income);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getIncomes = async (req, res) => {
  try {
    const { userId } = req.params;
    const incomes = await Income.find({ userId });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const income = await Income.findByIdAndDelete(id);
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    // Update user's monthly savings
    await updateMonthlySavings(
      income.userId,
      -income.amount,
      income.date,
      true
    );

    res.json({ message: "Income deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, source, description } = req.body;
    const income = await Income.findById(id);
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }
    await updateMonthlySavings(
      income.userId,
      -income.amount,
      income.date,
      true
    );
    await updateMonthlySavings(income.userId, amount, income.date, true);
    income.amount = amount;
    income.source = source;
    income.description = description;
    await income.save();
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
