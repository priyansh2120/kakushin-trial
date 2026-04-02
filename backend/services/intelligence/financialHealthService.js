import Expense from "../../models/expense.model.js";
import Income from "../../models/income.model.js";

/**
 * Financial Health Service
 * Generates insights for Working Professional Lab (ITR, TDS, EPF, tax regime).
 * Provides financial health summary score.
 */

// Indian tax slabs for FY 2024-25
const OLD_REGIME_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250001, max: 500000, rate: 5 },
  { min: 500001, max: 1000000, rate: 20 },
  { min: 1000001, max: Infinity, rate: 30 },
];

const NEW_REGIME_SLABS = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300001, max: 700000, rate: 5 },
  { min: 700001, max: 1000000, rate: 10 },
  { min: 1000001, max: 1200000, rate: 15 },
  { min: 1200001, max: 1500000, rate: 20 },
  { min: 1500001, max: Infinity, rate: 30 },
];

const COMMON_DEDUCTIONS = [
  { section: "80C", name: "PPF/ELSS/Insurance/Tuition", maxLimit: 150000 },
  { section: "80D", name: "Health Insurance", maxLimit: 25000 },
  { section: "80CCD(1B)", name: "NPS Additional", maxLimit: 50000 },
  { section: "24(b)", name: "Home Loan Interest", maxLimit: 200000 },
  { section: "80E", name: "Education Loan Interest", maxLimit: Infinity },
  { section: "80TTA", name: "Savings Account Interest", maxLimit: 10000 },
];

/**
 * Calculate tax under a given regime.
 */
const calculateTax = (income, slabs) => {
  let tax = 0;
  for (const slab of slabs) {
    if (income > slab.min) {
      const taxable = Math.min(income, slab.max) - slab.min + 1;
      tax += (taxable * slab.rate) / 100;
    }
  }
  return Math.round(tax);
};

/**
 * Compare old vs new tax regime and suggest better option.
 */
export const compareTaxRegimes = (annualIncome, deductions = {}) => {
  // Old regime: apply deductions
  let totalDeductions = 0;
  const missedDeductions = [];
  const claimedDeductions = [];

  for (const deduction of COMMON_DEDUCTIONS) {
    const claimed = deductions[deduction.section] || 0;
    const maxAllowed = deduction.maxLimit === Infinity ? claimed : deduction.maxLimit;
    totalDeductions += Math.min(claimed, maxAllowed);

    if (claimed > 0) {
      claimedDeductions.push({
        ...deduction,
        claimed,
        utilized: Math.min(claimed, maxAllowed),
      });
    } else {
      missedDeductions.push(deduction);
    }
  }

  // Standard deduction under old regime
  const standardDeductionOld = 50000;
  const taxableOld = Math.max(0, annualIncome - totalDeductions - standardDeductionOld);
  const taxOld = calculateTax(taxableOld, OLD_REGIME_SLABS);

  // New regime: standard deduction only
  const standardDeductionNew = 75000;
  const taxableNew = Math.max(0, annualIncome - standardDeductionNew);
  const taxNew = calculateTax(taxableNew, NEW_REGIME_SLABS);

  const savings = taxOld - taxNew;
  const betterRegime = savings > 0 ? "new" : "old";

  return {
    annualIncome,
    oldRegime: {
      taxableIncome: taxableOld,
      tax: taxOld,
      effectiveRate: annualIncome > 0 ? Math.round((taxOld / annualIncome) * 10000) / 100 : 0,
      totalDeductions: totalDeductions + standardDeductionOld,
    },
    newRegime: {
      taxableIncome: taxableNew,
      tax: taxNew,
      effectiveRate: annualIncome > 0 ? Math.round((taxNew / annualIncome) * 10000) / 100 : 0,
      standardDeduction: standardDeductionNew,
    },
    recommendation: {
      betterRegime,
      savingsAmount: Math.abs(savings),
      message: betterRegime === "new"
        ? `🔄 Switching to the new regime could save you ₹${Math.abs(savings)} in taxes.`
        : `📋 Staying with the old regime saves you ₹${Math.abs(savings)} thanks to your deductions.`,
    },
    missedDeductions: missedDeductions.map((d) => ({
      section: d.section,
      name: d.name,
      maxLimit: d.maxLimit,
      suggestion: `Consider claiming Section ${d.section} - ${d.name} (up to ₹${d.maxLimit === Infinity ? "No limit" : d.maxLimit}).`,
    })),
    claimedDeductions,
  };
};

/**
 * Compute EPF projections.
 */
export const computeEPFProjection = (monthlySalary, currentAge, retirementAge = 60) => {
  const basicSalary = monthlySalary * 0.5; // Assume basic is 50% of gross
  const employeeContribution = basicSalary * 0.12;
  const employerContribution = basicSalary * 0.12;
  const monthlyContribution = employeeContribution + employerContribution;
  const annualRate = 0.081; // Current EPF interest rate
  const monthlyRate = annualRate / 12;
  const months = (retirementAge - currentAge) * 12;

  // Future value of annuity formula
  const futureValue = months > 0
    ? monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    : 0;

  return {
    monthlySalary,
    basicSalary: Math.round(basicSalary),
    employeeContribution: Math.round(employeeContribution),
    employerContribution: Math.round(employerContribution),
    monthlyTotal: Math.round(monthlyContribution),
    annualContribution: Math.round(monthlyContribution * 12),
    projectedCorpus: Math.round(futureValue),
    yearsToRetirement: retirementAge - currentAge,
    interestRate: annualRate * 100,
  };
};

/**
 * Compute TDS analysis.
 */
export const analyzeTDS = (annualIncome, tdsDeducted) => {
  const estimatedTax = calculateTax(Math.max(0, annualIncome - 75000), NEW_REGIME_SLABS);
  const difference = tdsDeducted - estimatedTax;

  return {
    annualIncome,
    tdsDeducted,
    estimatedTax,
    difference: Math.round(difference),
    status: difference > 0 ? "refund_due" : difference < 0 ? "underpaid" : "balanced",
    message: difference > 0
      ? `💰 You may be eligible for a refund of ₹${Math.round(difference)}. File your ITR to claim it!`
      : difference < 0
        ? `⚠️ Your TDS may be short by ₹${Math.abs(Math.round(difference))}. Consider advance tax payment.`
        : `✅ Your TDS is well-aligned with your estimated tax liability.`,
  };
};

/**
 * Compute Financial Health Score (0-100).
 * Factors: savings_ratio + expense_control + investment_ratio
 */
export const computeFinancialHealth = async (userId) => {
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  const [expenses, incomes] = await Promise.all([
    Expense.find({ userId, date: { $gte: threeMonthsAgo } }),
    Income.find({ userId, date: { $gte: threeMonthsAgo } }),
  ]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  // Savings ratio (0-40 points)
  let savingsRatioScore = 0;
  if (totalIncome > 0) {
    const savingsRate = (totalIncome - totalExpenses) / totalIncome;
    if (savingsRate >= 0.3) savingsRatioScore = 40;
    else if (savingsRate >= 0.2) savingsRatioScore = 32;
    else if (savingsRate >= 0.1) savingsRatioScore = 24;
    else if (savingsRate >= 0) savingsRatioScore = 16;
    else savingsRatioScore = 5;
  } else {
    savingsRatioScore = 15;
  }

  // Expense control (0-35 points) - based on essential vs discretionary ratio
  const essentialExpenses = expenses.filter((e) => (e.necessityPercentage || 50) >= 60);
  const essentialTotal = essentialExpenses.reduce((sum, e) => sum + e.amount, 0);
  const essentialRatio = totalExpenses > 0 ? essentialTotal / totalExpenses : 0.5;

  let expenseControlScore;
  if (essentialRatio >= 0.6) expenseControlScore = 35;
  else if (essentialRatio >= 0.5) expenseControlScore = 28;
  else if (essentialRatio >= 0.4) expenseControlScore = 20;
  else if (essentialRatio >= 0.3) expenseControlScore = 12;
  else expenseControlScore = 5;

  // Consistency (0-25 points) - based on expense tracking regularity
  const monthlyExpenseCounts = {};
  for (const e of expenses) {
    const key = `${new Date(e.date).getFullYear()}-${new Date(e.date).getMonth()}`;
    monthlyExpenseCounts[key] = (monthlyExpenseCounts[key] || 0) + 1;
  }
  const activeMonths = Object.keys(monthlyExpenseCounts).length;
  let consistencyScore;
  if (activeMonths >= 3) consistencyScore = 25;
  else if (activeMonths >= 2) consistencyScore = 18;
  else if (activeMonths >= 1) consistencyScore = 10;
  else consistencyScore = 3;

  const total = savingsRatioScore + expenseControlScore + consistencyScore;
  const clampedTotal = Math.min(100, Math.max(0, total));

  // Identify weak areas
  const weakAreas = [];
  if (savingsRatioScore < 20) weakAreas.push("savings");
  if (expenseControlScore < 20) weakAreas.push("expense control");
  if (consistencyScore < 15) weakAreas.push("tracking consistency");

  return {
    score: clampedTotal,
    breakdown: {
      savingsRatio: { score: savingsRatioScore, max: 40 },
      expenseControl: { score: expenseControlScore, max: 35 },
      consistency: { score: consistencyScore, max: 25 },
    },
    weakAreas,
    message: `Your financial health is ${clampedTotal}/100.${weakAreas.length > 0 ? ` Weak area${weakAreas.length > 1 ? "s" : ""}: ${weakAreas.join(", ")}.` : " Great overall health!"}`,
  };
};
