import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../backend/models/user.model.js";
import Expense from "../backend/models/expense.model.js";
import Income from "../backend/models/income.model.js";
import Chore from "../backend/models/chore.model.js";
import Conversation from "../backend/models/conversation.model.js";
import CareerLabAttempt from "../backend/models/careerLabAttempt.model.js";
import StockGame from "../backend/models/stockGame.model.js";
import WeeklyInsight from "../backend/models/weeklyInsight.model.js";
import UserProfile from "../backend/models/userProfile.model.js";
import Nudge from "../backend/models/nudge.model.js";
import { Response } from "../backend/models/quiz.model.js";
import { DailyMissionProgress } from "../backend/models/mission.model.js";
import { buildUserProfile } from "../backend/services/intelligence/userProfileService.js";
import { computeDisciplineScore } from "../backend/services/intelligence/disciplineScoreService.js";
import { generateWeeklyInsight } from "../backend/services/intelligence/weeklyInsightService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../backend/.env") });

const DAY = 24 * 60 * 60 * 1000;

const profiles = [
  {
    oldUsername: "demo_aarav_mehta",
    username: "aaravmehta",
    name: "Aarav Mehta",
    gender: "male",
    profession: "Job",
    city: "Mumbai",
    state: "Maharashtra",
    income: 58000,
    currentWindowTotal: 16800,
    previousWindowTotal: 22600,
    streak: 14,
    monthlySavings: [14000, 17500, 23200],
    financialLiteracy: 12,
    virtualCurrency: 246,
    stockValue: 123850,
    stockProfit: 23850,
    prevWeekScore: 84,
  },
  {
    oldUsername: "demo_priya_sharma",
    username: "priyasharma",
    name: "Priya Sharma",
    gender: "female",
    profession: "Job",
    city: "Bengaluru",
    state: "Karnataka",
    income: 72000,
    currentWindowTotal: 24800,
    previousWindowTotal: 29800,
    streak: 10,
    monthlySavings: [16000, 19800, 24400],
    financialLiteracy: 15,
    virtualCurrency: 268,
    stockValue: 118400,
    stockProfit: 18400,
    prevWeekScore: 80,
  },
  {
    oldUsername: "demo_rohan_kulkarni",
    username: "rohankulkarni",
    name: "Rohan Kulkarni",
    gender: "male",
    profession: "Job",
    city: "Pune",
    state: "Maharashtra",
    income: 68000,
    currentWindowTotal: 40400,
    previousWindowTotal: 43800,
    streak: 7,
    monthlySavings: [12000, 13500, 14800],
    financialLiteracy: 11,
    virtualCurrency: 214,
    stockValue: 112900,
    stockProfit: 12900,
    prevWeekScore: 70,
  },
  {
    oldUsername: "demo_neha_iyer",
    username: "nehaiyer",
    name: "Neha Iyer",
    gender: "female",
    profession: "Job",
    city: "Chennai",
    state: "Tamil Nadu",
    income: 64000,
    currentWindowTotal: 47000,
    previousWindowTotal: 52000,
    streak: 5,
    monthlySavings: [0, 7200, 9100],
    financialLiteracy: 10,
    virtualCurrency: 205,
    stockValue: 109600,
    stockProfit: 9600,
    prevWeekScore: 68,
  },
  {
    oldUsername: "demo_karan_bansal",
    username: "karanbansal",
    name: "Karan Bansal",
    gender: "male",
    profession: "Job",
    city: "Delhi",
    state: "Delhi",
    income: 76000,
    currentWindowTotal: 70800,
    previousWindowTotal: 74400,
    streak: 3,
    monthlySavings: [-1200, 5400, 8600],
    financialLiteracy: 9,
    virtualCurrency: 188,
    stockValue: 104700,
    stockProfit: 4700,
    prevWeekScore: 65,
  },
  {
    oldUsername: "demo_ananya_verma",
    username: "ananyaverma",
    name: "Ananya Verma",
    gender: "female",
    profession: "Student",
    city: "Jaipur",
    state: "Rajasthan",
    income: 4500,
    currentWindowTotal: 2780,
    previousWindowTotal: 3520,
    streak: 8,
    monthlySavings: [0, 1200, 1650],
    financialLiteracy: 8,
    virtualCurrency: 174,
    stockValue: 107300,
    stockProfit: 7300,
    prevWeekScore: 66,
  },
  {
    oldUsername: "demo_aditya_rao",
    username: "adityarao",
    name: "Aditya Rao",
    gender: "male",
    profession: "Student",
    city: "Hyderabad",
    state: "Telangana",
    income: 6500,
    currentWindowTotal: 4260,
    previousWindowTotal: 4680,
    streak: 6,
    monthlySavings: [0, 900, 1300],
    financialLiteracy: 7,
    virtualCurrency: 162,
    stockValue: 104400,
    stockProfit: 4400,
    prevWeekScore: 60,
  },
  {
    oldUsername: "demo_sneha_patil",
    username: "snehapatil",
    name: "Sneha Patil",
    gender: "female",
    profession: "Student",
    city: "Nagpur",
    state: "Maharashtra",
    income: 5200,
    currentWindowTotal: 3920,
    previousWindowTotal: 4320,
    streak: 4,
    monthlySavings: [0, 650, 920],
    financialLiteracy: 6,
    virtualCurrency: 149,
    stockValue: 103200,
    stockProfit: 3200,
    prevWeekScore: 55,
  },
  {
    oldUsername: "demo_vivek_nair",
    username: "viveknair",
    name: "Vivek Nair",
    gender: "male",
    profession: "Student",
    city: "Kochi",
    state: "Kerala",
    income: 7000,
    currentWindowTotal: 6280,
    previousWindowTotal: 6820,
    streak: 2,
    monthlySavings: [-200, 420, 650],
    financialLiteracy: 5,
    virtualCurrency: 140,
    stockValue: 101900,
    stockProfit: 1900,
    prevWeekScore: 52,
  },
  {
    oldUsername: "demo_kavya_singh",
    username: "kavyasingh",
    name: "Kavya Singh",
    gender: "female",
    profession: "Student",
    city: "Lucknow",
    state: "Uttar Pradesh",
    income: 3800,
    currentWindowTotal: 3910,
    previousWindowTotal: 4180,
    streak: 1,
    monthlySavings: [0, 0, 350],
    financialLiteracy: 4,
    virtualCurrency: 132,
    stockValue: 100900,
    stockProfit: 900,
    prevWeekScore: 46,
  },
];

const categorySets = {
  Job: [
    { category: "Rent", necessityPercentage: 95, label: "rent transfer" },
    { category: "Food", necessityPercentage: 72, label: "office meals" },
    { category: "Transport", necessityPercentage: 84, label: "commute spend" },
    { category: "Health", necessityPercentage: 90, label: "medicine and wellness" },
    { category: "Entertainment", necessityPercentage: 24, label: "weekend outing" },
    { category: "Education", necessityPercentage: 68, label: "skill course payment" },
  ],
  Student: [
    { category: "Education", necessityPercentage: 94, label: "books and notes" },
    { category: "Food", necessityPercentage: 76, label: "canteen and snacks" },
    { category: "Transport", necessityPercentage: 82, label: "bus and metro card" },
    { category: "Entertainment", necessityPercentage: 18, label: "hangout spend" },
    { category: "Health", necessityPercentage: 88, label: "medical essentials" },
  ],
};

const stockSymbols = [
  ["RELIANCE.BSE", "Reliance Industries"],
  ["TCS.BSE", "Tata Consultancy Services"],
  ["INFY.BSE", "Infosys"],
  ["HDFCBANK.BSE", "HDFC Bank"],
  ["ICICIBANK.BSE", "ICICI Bank"],
  ["SBIN.BSE", "State Bank of India"],
];

const createDate = (daysAgo, hour = 11) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setTime(date.getTime() - daysAgo * DAY);
  return date;
};

const buildExpenseDocs = (userId, profile) => {
  const categories = categorySets[profile.profession];
  const docs = [];

  const previousWeights = profile.profession === "Job"
    ? [0.38, 0.17, 0.14, 0.08, 0.13, 0.1]
    : [0.34, 0.24, 0.14, 0.12, 0.16];
  const currentWeights = profile.profession === "Job"
    ? [0.34, 0.19, 0.13, 0.08, 0.12, 0.14]
    : [0.36, 0.23, 0.13, 0.1, 0.18];

  const buildWindow = (total, daysAgoList, weights, prefix) => {
    let running = 0;
    daysAgoList.forEach((daysAgo, index) => {
      const weight = weights[index] || 0.1;
      let amount =
        index === daysAgoList.length - 1
          ? total - running
          : Math.round(total * weight);
      running += amount;
      const categoryMeta = categories[index % categories.length];
      docs.push({
        userId,
        date: createDate(daysAgo, 10 + index),
        amount,
        category: categoryMeta.category,
        necessityPercentage: categoryMeta.necessityPercentage,
        description: `${prefix} ${categoryMeta.label}`,
      });
    });
  };

  buildWindow(profile.previousWindowTotal, [13, 12, 11, 10, 9, 8], previousWeights, "Previous-week");
  buildWindow(profile.currentWindowTotal, [5, 4, 3, 2, 1, 0], currentWeights, "Current-week");

  const olderDocs = profile.profession === "Job"
    ? [
        { daysAgo: 18, amount: 1800, category: "Food", necessityPercentage: 70, description: "Earlier month dining and groceries" },
        { daysAgo: 16, amount: 2300, category: "Transport", necessityPercentage: 82, description: "Earlier month commute pack" },
      ]
    : [
        { daysAgo: 18, amount: 480, category: "Education", necessityPercentage: 92, description: "Earlier month stationery refill" },
        { daysAgo: 16, amount: 350, category: "Food", necessityPercentage: 74, description: "Earlier month canteen spend" },
      ];

  for (const doc of olderDocs) {
    docs.push({
      userId,
      date: createDate(doc.daysAgo, 14),
      amount: doc.amount,
      category: doc.category,
      necessityPercentage: doc.necessityPercentage,
      description: doc.description,
    });
  }

  return docs;
};

const buildIncomeDocs = (userId, profile) => {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 2, 9, 0, 0, 0);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 3, 9, 0, 0, 0);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 4, 9, 0, 0, 0);

  if (profile.profession === "Job") {
    return [
      { userId, date: currentMonth, amount: profile.income, source: "Salary", description: "Monthly salary credit" },
      { userId, date: previousMonth, amount: Math.round(profile.income * 0.98), source: "Salary", description: "Previous month salary credit" },
      { userId, date: twoMonthsAgo, amount: Math.round(profile.income * 0.97), source: "Salary", description: "Two months ago salary credit" },
      { userId, date: createDate(6, 20), amount: Math.round(profile.income * 0.08), source: "Freelance", description: "Weekend freelance payment" },
    ];
  }

  return [
    { userId, date: currentMonth, amount: profile.income, source: "Allowance", description: "Monthly family allowance" },
    { userId, date: previousMonth, amount: Math.round(profile.income * 0.95), source: "Allowance", description: "Previous month allowance" },
    { userId, date: twoMonthsAgo, amount: Math.round(profile.income * 0.92), source: "Scholarship", description: "Semester scholarship support" },
    { userId, date: createDate(7, 17), amount: Math.round(profile.income * 0.42), source: "Part Time", description: "Weekend tutoring payout" },
  ];
};

const buildMissionDocs = (userId, streak) => {
  const docs = [];
  for (let index = streak - 1; index >= 0; index -= 1) {
    const dayIndex = streak - index;
    const date = createDate(index).toISOString().split("T")[0];
    const completed = [
      "log_expense",
      "log_income",
      "complete_quiz",
      "chat_ai",
      "complete_chore",
    ].slice(0, dayIndex % 2 === 0 ? 4 : 5);

    docs.push({
      userId,
      date,
      streak: dayIndex,
      completedMissions: completed.map((missionKey, missionIndex) => ({
        missionKey,
        completedAt: createDate(index, 9 + missionIndex),
        rewardClaimed: true,
      })),
    });
  }
  return docs;
};

const buildConversationDocs = (userId, profile) => [
  {
    userId,
    title: "Monthly finance planning",
    createdAt: createDate(6, 21),
    updatedAt: createDate(6, 21),
    messages: [
      {
        role: "user",
        content: `I live in ${profile.city}. Help me structure my monthly finances better.`,
        timestamp: createDate(6, 21),
      },
      {
        role: "assistant",
        content: "Focus first on essentials, then lock savings before discretionary spending.",
        agent: "financial_advisor",
        timestamp: createDate(6, 21),
      },
    ],
  },
  {
    userId,
    title: "Expense review",
    createdAt: createDate(2, 19),
    updatedAt: createDate(2, 19),
    messages: [
      {
        role: "user",
        content: "Review my recent spending pattern and tell me if there is a risk.",
        timestamp: createDate(2, 19),
      },
      {
        role: "assistant",
        content: "Your spending is manageable, but you should keep a tighter cap on discretionary costs.",
        agent: "expense_analyzer",
        isStructured: true,
        structuredData: { summary: "Spending manageable with caution on non-essentials" },
        timestamp: createDate(2, 19),
      },
    ],
  },
  {
    userId,
    title: "Smart categorizer",
    createdAt: createDate(0, 18),
    updatedAt: createDate(0, 18),
    messages: [
      {
        role: "user",
        content: profile.profession === "Job" ? "Categorize metro recharge and cab expense." : "Categorize canteen lunch and xerox expense.",
        timestamp: createDate(0, 18),
      },
      {
        role: "assistant",
        content: "Categorized successfully.",
        agent: "smart_categorizer",
        isStructured: true,
        structuredData: { category: profile.profession === "Job" ? "Transport" : "Education" },
        timestamp: createDate(0, 18),
      },
    ],
  },
];

const buildChores = (userId, profile) => {
  const definitions = profile.profession === "Job"
    ? [
        { description: "Pay broadband bill", dueOffset: 1, priority: "High", completed: true, completedAgo: 0 },
        { description: "Sort tax documents", dueOffset: 2, priority: "Medium", completed: true, completedAgo: 1 },
        { description: "Plan weekly groceries", dueOffset: 3, priority: "Medium", completed: false },
        { description: "Renew medicine stock", dueOffset: -1, priority: "High", completed: false },
      ]
    : [
        { description: "Finish notes for tomorrow", dueOffset: 1, priority: "High", completed: true, completedAgo: 0 },
        { description: "Clean study desk", dueOffset: 2, priority: "Low", completed: false },
        { description: "Prepare assignment checklist", dueOffset: -1, priority: "Medium", completed: true, completedAgo: 2 },
      ];

  return definitions.map((item, index) => ({
    userId,
    description: item.description,
    isCompleted: item.completed || false,
    addedByParent: false,
    addedBy: userId,
    dateAdded: createDate(4 + index, 8),
    dueDate: createDate(-item.dueOffset, 20),
    priority: item.priority,
    dateCompleted: item.completed ? createDate(item.completedAgo, 17) : null,
  }));
};

const buildQuizResponses = (userId, profile) => {
  const docs = [];
  const scores = profile.profession === "Job" ? [4, 5, 3] : [3, 2, 3];
  scores.forEach((score, index) => {
    const createdAt = createDate(7 - index * 2, 16);
    const objectId = mongoose.Types.ObjectId.createFromTime(
      Math.floor(createdAt.getTime() / 1000)
    );
    docs.push({
      _id: objectId,
      userId: String(userId),
      responses: [],
      score,
    });
  });
  return docs;
};

const buildCareerAttempts = (userId, profile) => {
  if (profile.profession !== "Job") return [];
  return [
    {
      userId,
      moduleId: "itr-filing",
      professionSnapshot: "Job",
      attemptData: {
        scenarioSummary: "Prepared ITR-1 using Form 16, AIS and bank interest details.",
        chosenActions: "Checked prefilled data, compared regimes, verified deductions and chose e-verification.",
        checksPerformed: "Reviewed Form 16, 26AS, AIS, bank details and final preview.",
        finalDecision: "Proceed under the better-fit regime and submit after confirming all credits.",
      },
      aiEvaluation: {
        summary: "A solid filing attempt with good verification discipline.",
        strengths: ["Used the right return path", "Reviewed tax credit sources"],
        mistakes: ["Could document deduction support more clearly"],
        recommendedNextSteps: ["Double-check deduction proofs before final submission"],
        rubricBreakdown: [
          { criterion: "document readiness", score: 24, comment: "Most filing documents were covered." },
          { criterion: "return type and regime reasoning", score: 23, comment: "Regime reasoning was sensible and practical." },
        ],
      },
      overallScore: profile.username === "aaravmehta" ? 93 : 87,
      grade: profile.username === "aaravmehta" ? "A" : "B+",
      createdAt: createDate(5, 15),
      updatedAt: createDate(5, 15),
    },
    {
      userId,
      moduleId: "tds-check",
      professionSnapshot: "Job",
      attemptData: {
        scenarioSummary: "Reconciled a mismatch between salary records and tax statements.",
        chosenActions: "Compared Form 16, AIS and 26AS and contacted payroll after spotting a variance.",
        checksPerformed: "Matched TDS numbers, bank interest and bonus records before deciding next steps.",
        finalDecision: "Pause filing until the mismatch is documented and resolved cleanly.",
      },
      aiEvaluation: {
        summary: "Good reconciliation thinking with a sensible decision to pause filing.",
        strengths: ["Used the right source documents", "Did not rush submission"],
        mistakes: ["Could capture employer follow-up evidence more explicitly"],
        recommendedNextSteps: ["Document the mismatch trail before refiling"],
        rubricBreakdown: [
          { criterion: "tax-credit and prefill verification", score: 22, comment: "Tax-credit cross-check was strong." },
          { criterion: "submission awareness", score: 21, comment: "Held submission until mismatch resolution." },
        ],
      },
      overallScore: profile.username === "priyasharma" ? 91 : 84,
      grade: profile.username === "priyasharma" ? "A" : "B+",
      createdAt: createDate(1, 14),
      updatedAt: createDate(1, 14),
    },
  ];
};

const buildStockGame = (userId, profile, index) => {
  const selected = stockSymbols.slice(index % 3, index % 3 + 3);
  const holdings = selected.map(([symbol, name], holdingIndex) => ({
    symbol,
    name,
    shares: 5 + index + holdingIndex * 2,
    avgBuyPrice: 900 + index * 120 + holdingIndex * 250,
  }));

  const transactions = holdings.flatMap((holding, holdingIndex) => [
    {
      symbol: holding.symbol,
      type: "buy",
      shares: holding.shares,
      price: holding.avgBuyPrice,
      total: holding.shares * holding.avgBuyPrice,
      timestamp: createDate(6 - holdingIndex * 2, 11 + holdingIndex),
    },
    {
      symbol: holding.symbol,
      type: "sell",
      shares: 1,
      price: Math.round(holding.avgBuyPrice * 1.07),
      total: Math.round(holding.avgBuyPrice * 1.07),
      timestamp: createDate(1 + holdingIndex, 15),
    },
  ]);

  return {
    userId,
    cashBalance: Math.round(100000 - (profile.stockValue - 100000) * 0.45),
    portfolio: holdings,
    transactions,
    totalPortfolioValue: profile.stockValue,
    profitLoss: profile.stockProfit,
    createdAt: createDate(20, 10),
    updatedAt: createDate(0, 19),
  };
};

const getWeekStartString = (date) => {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  current.setDate(diff);
  current.setHours(0, 0, 0, 0);
  return current.toISOString().split("T")[0];
};

async function rebuildUser(profile, index) {
  const user = await User.findOne({
    username: { $in: [profile.oldUsername, profile.username] },
  });

  if (!user) {
    throw new Error(`User not found for ${profile.username}`);
  }

  user.username = profile.username;
  user.name = profile.name;
  user.country = "India";
  user.state = profile.state;
  user.city = profile.city;
  user.profession = profile.profession;
  user.income = profile.income;
  user.profilePictureUrl = `https://avatar.iran.liara.run/public/${profile.gender === "male" ? "boy" : "girl"}?username=${profile.username}`;
  user.joinDate = createDate(35 + index * 3, 12);
  user.monthlySavings = [
    { month: 2, year: 2026, amount: profile.monthlySavings[0] },
    { month: 3, year: 2026, amount: profile.monthlySavings[1] },
    { month: 4, year: 2026, amount: profile.monthlySavings[2] },
  ];
  user.virtualCurrency = profile.virtualCurrency;
  user.financialLiteracy = profile.financialLiteracy;
  await user.save();

  const userId = user._id;

  await Promise.all([
    Expense.deleteMany({ userId }),
    Income.deleteMany({ userId }),
    Chore.deleteMany({ userId }),
    Conversation.deleteMany({ userId }),
    CareerLabAttempt.deleteMany({ userId }),
    StockGame.deleteMany({ userId }),
    WeeklyInsight.deleteMany({ userId }),
    UserProfile.deleteMany({ userId }),
    Nudge.deleteMany({ userId }),
    DailyMissionProgress.deleteMany({ userId }),
    Response.deleteMany({ userId: String(userId) }),
  ]);

  await Expense.insertMany(buildExpenseDocs(userId, profile));
  await Income.insertMany(buildIncomeDocs(userId, profile));
  await Chore.insertMany(buildChores(userId, profile));
  await Conversation.insertMany(buildConversationDocs(userId, profile));
  await DailyMissionProgress.insertMany(buildMissionDocs(userId, profile.streak));
  await Response.insertMany(buildQuizResponses(userId, profile));

  const attempts = buildCareerAttempts(userId, profile);
  if (attempts.length) {
    await CareerLabAttempt.insertMany(attempts);
  }

  await StockGame.create(buildStockGame(userId, profile, index));

  await buildUserProfile(userId);
  const score = await computeDisciplineScore(userId);

  const currentWeek = getWeekStartString(new Date());
  const previousWeek = getWeekStartString(new Date(Date.now() - 7 * DAY));

  await UserProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        weeklyScores: [
          { week: previousWeek, score: profile.prevWeekScore },
          { week: currentWeek, score: score.total },
        ],
      },
    }
  );

  await generateWeeklyInsight(userId, new Date(Date.now() - 7 * DAY));
  await generateWeeklyInsight(userId, new Date());

  await User.findByIdAndUpdate(userId, {
    $set: {
      virtualCurrency: profile.virtualCurrency,
      financialLiteracy: profile.financialLiteracy,
    },
  });

  return {
    username: profile.username,
    disciplineScore: score.total,
    grade: score.grade,
  };
}

async function main() {
  await mongoose.connect(process.env.DB_URI);

  const results = [];
  try {
    for (let index = 0; index < profiles.length; index += 1) {
      const profile = profiles[index];
      process.stdout.write(`Polishing ${profile.username}... `);
      const result = await rebuildUser(profile, index);
      results.push(result);
      process.stdout.write(`done (${result.disciplineScore})\n`);
    }
  } finally {
    await mongoose.disconnect();
  }

  console.log("\nUpdated usernames:");
  for (const profile of profiles) {
    console.log(`- ${profile.oldUsername} -> ${profile.username}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
