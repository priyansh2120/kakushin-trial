export const calculatePoints = (expenses) => {
  return expenses.reduce((total, expense) => {
    const randomFactor = Math.random();
    return total + expense.amount * randomFactor;
  }, 0);
};
