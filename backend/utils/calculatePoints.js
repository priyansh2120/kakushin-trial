export const calculatePoints = (expenses) => {
  return expenses.reduce((total, expense) => {
    const necessityBonus = expense.necessityPercentage
      ? expense.necessityPercentage / 10
      : 1;
    return total + expense.amount * 0.01 + necessityBonus;
  }, 0);
};
