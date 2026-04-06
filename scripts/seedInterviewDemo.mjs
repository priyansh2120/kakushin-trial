import { writeFile } from "node:fs/promises";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:8080";
const PASSWORD = process.env.DEMO_PASSWORD || "Pass@123";
const requestedUsernames = process.env.DEMO_USERNAMES
  ? new Set(
      process.env.DEMO_USERNAMES.split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  : null;

const demoUsers = [
  {
    name: "Aarav Mehta",
    username: "demo_aarav_mehta",
    gender: "male",
    age: 26,
    profession: "Job",
    income: 58000,
    city: "Mumbai",
    state: "Maharashtra",
    goal: { type: "saving", targetAmount: 180000, deadline: "2026-12-31" },
  },
  {
    name: "Priya Sharma",
    username: "demo_priya_sharma",
    gender: "female",
    age: 28,
    profession: "Job",
    income: 72000,
    city: "Bengaluru",
    state: "Karnataka",
    goal: { type: "saving", targetAmount: 240000, deadline: "2026-11-30" },
  },
  {
    name: "Rohan Kulkarni",
    username: "demo_rohan_kulkarni",
    gender: "male",
    age: 31,
    profession: "Job",
    income: 68000,
    city: "Pune",
    state: "Maharashtra",
    goal: { type: "saving", targetAmount: 200000, deadline: "2026-10-31" },
  },
  {
    name: "Neha Iyer",
    username: "demo_neha_iyer",
    gender: "female",
    age: 27,
    profession: "Job",
    income: 64000,
    city: "Chennai",
    state: "Tamil Nadu",
    goal: { type: "saving", targetAmount: 150000, deadline: "2026-09-30" },
  },
  {
    name: "Karan Bansal",
    username: "demo_karan_bansal",
    gender: "male",
    age: 29,
    profession: "Job",
    income: 76000,
    city: "Delhi",
    state: "Delhi",
    goal: { type: "saving", targetAmount: 300000, deadline: "2026-12-15" },
  },
  {
    name: "Ananya Verma",
    username: "demo_ananya_verma",
    gender: "female",
    age: 19,
    profession: "Student",
    income: 4500,
    city: "Jaipur",
    state: "Rajasthan",
    goal: { type: "saving", targetAmount: 25000, deadline: "2026-12-31" },
  },
  {
    name: "Aditya Rao",
    username: "demo_aditya_rao",
    gender: "male",
    age: 21,
    profession: "Student",
    income: 6500,
    city: "Hyderabad",
    state: "Telangana",
    goal: { type: "saving", targetAmount: 30000, deadline: "2026-12-31" },
  },
  {
    name: "Sneha Patil",
    username: "demo_sneha_patil",
    gender: "female",
    age: 20,
    profession: "Student",
    income: 5200,
    city: "Nagpur",
    state: "Maharashtra",
    goal: { type: "saving", targetAmount: 22000, deadline: "2026-12-31" },
  },
  {
    name: "Vivek Nair",
    username: "demo_vivek_nair",
    gender: "male",
    age: 22,
    profession: "Student",
    income: 7000,
    city: "Kochi",
    state: "Kerala",
    goal: { type: "saving", targetAmount: 35000, deadline: "2026-11-30" },
  },
  {
    name: "Kavya Singh",
    username: "demo_kavya_singh",
    gender: "female",
    age: 18,
    profession: "Student",
    income: 3800,
    city: "Lucknow",
    state: "Uttar Pradesh",
    goal: { type: "saving", targetAmount: 18000, deadline: "2026-12-31" },
  },
];

const expenseTemplates = {
  Job: [
    { category: "Food", amount: 280, necessityPercentage: 75, description: "Office lunch combo" },
    { category: "Transport", amount: 220, necessityPercentage: 85, description: "Metro and auto commute" },
    { category: "Entertainment", amount: 650, necessityPercentage: 25, description: "Weekend movie night" },
    { category: "Health", amount: 450, necessityPercentage: 90, description: "Pharmacy essentials" },
  ],
  Student: [
    { category: "Food", amount: 120, necessityPercentage: 80, description: "College canteen lunch" },
    { category: "Education", amount: 340, necessityPercentage: 95, description: "Reference book purchase" },
    { category: "Transport", amount: 90, necessityPercentage: 85, description: "Bus pass top-up" },
    { category: "Entertainment", amount: 180, necessityPercentage: 20, description: "Cafe outing with friends" },
  ],
};

const incomeTemplates = {
  Job: [
    { amount: 58000, source: "Salary", description: "Monthly salary credit" },
    { amount: 3500, source: "Freelance", description: "Weekend freelance project" },
  ],
  Student: [
    { amount: 3500, source: "Allowance", description: "Monthly allowance from family" },
    { amount: 1800, source: "Scholarship", description: "Academic scholarship credit" },
  ],
};

const choreTemplates = {
  Job: [
    { description: "Pay electricity bill", offsetDays: 0, priority: "High" },
    { description: "Plan weekly groceries", offsetDays: 1, priority: "Medium" },
    { description: "Organize salary documents", offsetDays: -1, priority: "Medium" },
  ],
  Student: [
    { description: "Finish assignment checklist", offsetDays: 0, priority: "High" },
    { description: "Clean study desk", offsetDays: 1, priority: "Low" },
    { description: "Prepare notes for revision", offsetDays: -1, priority: "Medium" },
  ],
};

const budgetScenarios = {
  Job: {
    scenario:
      "You are a salaried employee in an Indian metro city balancing rent, essentials, and long-term savings goals.",
    allocation: {
      Rent: 18000,
      Food: 7000,
      Transport: 3500,
      Entertainment: 3000,
      Savings: 12000,
      Education: 2500,
      Health: 2000,
      "Emergency Fund": 4000,
    },
  },
  Student: {
    scenario:
      "You are a college student managing a monthly family-supported budget in India while trying to save for studies.",
    allocation: {
      Rent: 0,
      Food: 1500,
      Transport: 600,
      Entertainment: 500,
      Savings: 1200,
      Education: 1800,
      Health: 400,
      "Emergency Fund": 500,
    },
  },
};

const careerAttempts = [
  {
    moduleId: "itr-filing",
    attemptData: {
      scenarioSummary: "Salaried employee filing ITR-1 with Form 16 and small bank interest.",
      chosenActions:
        "Reviewed prefilled salary, checked 26AS and AIS, selected ITR-1, compared regimes, and prepared Aadhaar OTP verification.",
      checksPerformed:
        "Verified Form 16, bank account, deductions, tax credits, and final preview before submission.",
      finalDecision:
        "Proceed with filing under the more suitable regime after confirming all tax credits and submit with e-verification.",
    },
  },
  {
    moduleId: "tds-check",
    attemptData: {
      scenarioSummary: "Employee noticed mismatch between salary records and tax statements before filing.",
      chosenActions:
        "Compared Form 16, 26AS, and AIS values, checked bonus and interest income, and gathered payroll documents.",
      checksPerformed:
        "Verified TDS entries, contacted payroll, and reviewed whether all income heads were captured correctly.",
      finalDecision:
        "Pause filing until the mismatch is reconciled, then proceed only after corrected evidence is available.",
    },
  },
];

class SessionClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.cookie = "";
  }

  async request(path, { method = "GET", body, headers = {} } = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(this.cookie ? { Cookie: this.cookie } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      this.cookie = setCookie.split(";")[0];
    }

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      const message =
        (data && typeof data === "object" && (data.error || data.message)) ||
        `${response.status} ${response.statusText}`;
      throw new Error(message);
    }

    return data;
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseRetryDelay = (message, attempt) => {
  const secondsMatch = String(message).match(/Please try again in ([0-9.]+)s/i);
  if (secondsMatch) {
    return Math.ceil(Number(secondsMatch[1]) * 1000) + 1200;
  }
  const msMatch = String(message).match(/Please try again in ([0-9.]+)ms/i);
  if (msMatch) {
    return Math.ceil(Number(msMatch[1])) + 1200;
  }
  return 3500 + attempt * 2000;
};

const shouldRetryAI = (message) => {
  const text = String(message).toLowerCase();
  return (
    text.includes("rate limit") ||
    text.includes("too many requests") ||
    text.includes("failed to process ai query") ||
    text.includes("failed to categorize expense") ||
    text.includes("failed to evaluate budget") ||
    text.includes("failed to generate quiz") ||
    text.includes("failed to evaluate career lab attempt")
  );
};

async function aiRequest(session, path, options, label) {
  const maxAttempts = 5;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await session.request(path, options);
      await delay(6500);
      return result;
    } catch (error) {
      lastError = error;
      if (!shouldRetryAI(error.message) || attempt === maxAttempts) {
        throw new Error(`${label}: ${error.message}`);
      }
      await delay(parseRetryDelay(error.message, attempt));
    }
  }

  throw lastError;
}

const formatDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
};

const pickCareerAttempt = (index) =>
  careerAttempts[index % careerAttempts.length];

const buildQuizSubmission = (questions, userId, accuracy = 0.6) => {
  const desiredCorrect = Math.max(
    1,
    Math.min(questions.length, Math.round(questions.length * accuracy))
  );

  const results = questions.map((question, index) => {
    const shouldBeCorrect = index < desiredCorrect;
    const selectedAnswer = shouldBeCorrect
      ? question.correctAnswer
      : question.options.find((option) => option !== question.correctAnswer) ||
        question.correctAnswer;

    return {
      questionId: question._id || undefined,
      question: question.question,
      selectedAnswer,
      userAnswer: selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: selectedAnswer === question.correctAnswer,
      explanation: question.explanation || "",
    };
  });

  const score = results.filter((result) => result.isCorrect).length;
  return { userId, score, results };
};

async function ensureUser(session, profile) {
  try {
    await session.request("/api/auth/signup", {
      method: "POST",
      body: {
        name: profile.name,
        username: profile.username,
        password: PASSWORD,
        confirmPassword: PASSWORD,
        gender: profile.gender,
        age: profile.age,
        profession: profile.profession,
        income: profile.income,
      },
    });
    return "signed_up";
  } catch (error) {
    if (!String(error.message).includes("Username already exists")) {
      throw error;
    }
    await session.request("/api/auth/login", {
      method: "POST",
      body: {
        username: profile.username,
        password: PASSWORD,
      },
    });
    return "logged_in";
  }
}

async function seedUser(profile, index) {
  const session = new SessionClient(BASE_URL);
  const authState = await ensureUser(session, profile);
  const me = await session.request("/api/auth/me");

  await session.request(`/api/auth/updateUser/${me._id}`, {
    method: "PUT",
    body: {
      city: profile.city,
      state: profile.state,
      country: "India",
    },
  });

  if (profile.goal) {
    await session.request("/api/intelligence/profile/goals", {
      method: "POST",
      body: profile.goal,
    });
  }

  const incomes = incomeTemplates[profile.profession];
  for (const income of incomes) {
    const scaledAmount =
      profile.profession === "Job"
        ? income.source === "Salary"
          ? profile.income
          : Math.round(profile.income * 0.08)
        : income.source === "Allowance"
          ? profile.income
          : Math.round(profile.income * 0.45);
    await session.request("/api/income/add", {
      method: "POST",
      body: {
        userId: me._id,
        amount: scaledAmount,
        source: income.source,
        description: income.description,
      },
    });
  }

  const expenses = expenseTemplates[profile.profession];
  for (let expenseIndex = 0; expenseIndex < expenses.length; expenseIndex += 1) {
    const expense = expenses[expenseIndex];
    const amount =
      profile.profession === "Job"
        ? expense.amount + index * 25 + expenseIndex * 10
        : expense.amount + index * 12 + expenseIndex * 5;
    await session.request("/api/expense/add", {
      method: "POST",
      body: {
        userId: me._id,
        amount,
        category: expense.category,
        necessityPercentage: expense.necessityPercentage,
        description: expense.description,
      },
    });
  }

  const createdChores = [];
  for (const chore of choreTemplates[profile.profession]) {
    const created = await session.request("/api/chore/add", {
      method: "POST",
      body: {
        userId: me._id,
        description: chore.description,
        addedByParent: false,
        dueDate: formatDate(chore.offsetDays),
        priority: chore.priority,
      },
    });
    createdChores.push(created);
  }

  const choresToComplete = createdChores.slice(0, profile.profession === "Job" ? 2 : 1);
  for (const chore of choresToComplete) {
    await session.request(`/api/chore/${chore._id}`, {
      method: "PUT",
      body: {
        userId: me._id,
      },
    });
  }

  await aiRequest(session, "/api/chat/message", {
    method: "POST",
    body: {
      message: `I am ${profile.name} from ${profile.city}. Based on my current income and spending, give me one practical money habit for this month.`,
    },
  }, "chat");

  await aiRequest(session, "/api/chat/categorize", {
    method: "POST",
    body: {
      description:
        profile.profession === "Job"
          ? "Cab ride to office and metro recharge"
          : "Canteen lunch and photocopy expense",
      amount: profile.profession === "Job" ? 280 : 95,
    },
  }, "categorize");

  await aiRequest(session, "/api/chat/insights", undefined, "insights");

  const aiQuiz = await aiRequest(session, "/api/chat/generate-quiz", {
    method: "POST",
    body: {
      topic: profile.profession === "Job" ? "tax" : "budgeting",
      numQuestions: 5,
    },
  }, "quiz");

  await session.request("/api/quiz/submit", {
    method: "POST",
    body: buildQuizSubmission(
      aiQuiz.questions || [],
      me._id,
      profile.profession === "Job" ? 0.8 : 0.6
    ),
  });
  await delay(150);

  const budgetPayload = budgetScenarios[profile.profession];
  await aiRequest(session, "/api/games/budget-challenge", {
    method: "POST",
    body: budgetPayload,
  }, "budget");

  if (profile.profession === "Job") {
    await aiRequest(session, "/api/career-lab/attempts", {
      method: "POST",
      body: pickCareerAttempt(index),
    }, "career-lab");
  }

  const marketData = await session.request("/api/games/stocks/market");
  await session.request("/api/games/stocks/portfolio");
  const tradable = marketData.slice(index % 3, index % 3 + 3);
  for (let stockIndex = 0; stockIndex < tradable.length; stockIndex += 1) {
    const stock = tradable[stockIndex];
    const targetSpend =
      profile.profession === "Job"
        ? 12000 + stockIndex * 4000 + index * 500
        : 6000 + stockIndex * 2500 + index * 300;
    const shares = Math.max(1, Math.floor(targetSpend / stock.price));
    await session.request("/api/games/stocks/buy", {
      method: "POST",
      body: {
        symbol: stock.symbol,
        shares,
      },
    });
  }

  if (index % 2 === 0 && tradable[0]) {
    await session.request("/api/games/stocks/sell", {
      method: "POST",
      body: {
        symbol: tradable[0].symbol,
        shares: 1,
      },
    });
  }

  const daily = await session.request("/api/missions/daily");
  const missionResults = [];
  for (const mission of daily.missions) {
    if (!mission.canClaim) continue;
    const claim = await session.request("/api/missions/complete", {
      method: "POST",
      body: {
        missionKey: mission.key,
      },
    });
    missionResults.push({ key: mission.key, reward: claim.reward });
  }

  await session.request("/api/intelligence/profile/refresh", { method: "POST" });
  const dashboard = await session.request("/api/intelligence/dashboard");
  const finalUser = await session.request("/api/auth/me");
  const stockPortfolio = await session.request("/api/games/stocks/portfolio");

  return {
    name: profile.name,
    username: profile.username,
    password: PASSWORD,
    profession: profile.profession,
    city: profile.city,
    authState,
    userId: me._id,
    virtualCurrency: finalUser.virtualCurrency,
    financialLiteracy: finalUser.financialLiteracy,
    disciplineScore: dashboard?.disciplineScore?.total || 0,
    grade: dashboard?.disciplineScore?.grade || null,
    persona: dashboard?.profile?.persona || null,
    riskLevel: dashboard?.profile?.riskLevel || null,
    completedMissionCount: missionResults.length,
    portfolioValue: stockPortfolio?.totalPortfolioValue || 0,
    profitLoss: stockPortfolio?.profitLoss || 0,
  };
}

async function main() {
  const summaries = [];
  const failures = [];
  const usersToSeed = requestedUsernames
    ? demoUsers.filter((user) => requestedUsernames.has(user.username))
    : demoUsers;

  for (let index = 0; index < usersToSeed.length; index += 1) {
    const profile = usersToSeed[index];
    process.stdout.write(`Seeding ${profile.username}... `);
    try {
      const summary = await seedUser(profile, index);
      summaries.push(summary);
      process.stdout.write("done\n");
    } catch (error) {
      failures.push({ username: profile.username, error: error.message });
      process.stdout.write(`failed (${error.message})\n`);
    }
  }

  const publicClient = new SessionClient(BASE_URL);
  const smartLeaderboard = await publicClient.request("/api/intelligence/leaderboard");
  const stockLeaderboard = await publicClient.request("/api/games/stocks/leaderboard");
  const expenseLeaderboard = await publicClient.request("/api/expense/get/leaderboard");

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    seededUsers: summaries,
    failures,
    smartLeaderboardTop5: smartLeaderboard.slice(0, 5),
    stockLeaderboardTop5: stockLeaderboard.slice(0, 5),
    expenseLeaderboardTopCompetition: expenseLeaderboard[0] || null,
  };

  await writeFile(
    new URL("../demo-interview-users.json", import.meta.url),
    JSON.stringify(report, null, 2)
  );

  console.log("\nTop Smart Leaderboard:");
  for (const [position, entry] of smartLeaderboard.slice(0, 5).entries()) {
    console.log(
      `${position + 1}. ${entry.name} (${entry.profession}) - rank ${entry.rankScore}, coins ${entry.virtualCurrency}, literacy ${entry.financialLiteracy}`
    );
  }

  console.log("\nTop Stock Leaderboard:");
  for (const [position, entry] of stockLeaderboard.slice(0, 5).entries()) {
    console.log(
      `${position + 1}. ${entry.name} - value ${entry.totalValue}, P/L ${entry.profitLoss}`
    );
  }

  console.log("\nDemo credentials saved to demo-interview-users.json");
  if (failures.length > 0) {
    console.log("\nFailures:");
    for (const failure of failures) {
      console.log(`- ${failure.username}: ${failure.error}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
