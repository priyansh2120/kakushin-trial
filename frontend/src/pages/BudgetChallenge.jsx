import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Target, Sparkles, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import API_BASE_URL from '../config';

const CATEGORIES = [
  { key: 'rent', label: 'Rent & Housing', icon: '🏠', suggested: '30-35%' },
  { key: 'food', label: 'Food & Groceries', icon: '🍽️', suggested: '15-20%' },
  { key: 'transport', label: 'Transport', icon: '🚌', suggested: '5-10%' },
  { key: 'education', label: 'Education', icon: '📚', suggested: '5-10%' },
  { key: 'health', label: 'Health', icon: '🏥', suggested: '3-5%' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎮', suggested: '5-10%' },
  { key: 'savings', label: 'Savings', icon: '🏦', suggested: '15-20%' },
  { key: 'emergency', label: 'Emergency Fund', icon: '🛟', suggested: '5-10%' },
];

const SCENARIOS = [
  {
    title: "Aditi's First Job",
    description: "You're 22, just started your first job in Pune with ₹30,000/month. You live in a shared apartment. How would you allocate your salary?",
    budget: 30000,
    persona: "Aditi, 22, first job, middle class family, low financial literacy",
  },
  {
    title: "Ravi's School Budget",
    description: "You're 16, studying in Mumbai. Your parents give you ₹5,000/month for all your needs including school supplies, snacks, and transport. Budget wisely!",
    budget: 5000,
    persona: "Ravi, 16, student, NGO supported school",
  },
  {
    title: "Neha's Savings Goal",
    description: "You're 14, in Jaipur. Your family earns ₹15,000/month. Help your family allocate the budget while also saving for your education.",
    budget: 15000,
    persona: "Neha, 14, 9th grade, parents are daily wage workers",
  },
];

const BudgetChallenge = () => {
  const [scenario, setScenario] = useState(null);
  const [allocations, setAllocations] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useContext(UserContext);

  const totalAllocated = Object.values(allocations).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const remaining = scenario ? scenario.budget - totalAllocated : 0;

  const handleAllocationChange = (key, value) => {
    const numValue = Math.max(0, Number(value) || 0);
    setAllocations({ ...allocations, [key]: numValue });
  };

  const handleSubmit = async () => {
    if (!scenario || totalAllocated === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/games/budget-challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          allocation: allocations,
          scenario: `${scenario.description} Persona: ${scenario.persona}. Total budget: ₹${scenario.budget}`,
        }),
      });
      const data = await res.json();
      setResult(data);
      refreshUser();
    } catch (err) {
      console.error('Budget challenge error:', err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setScenario(null);
    setAllocations({});
    setResult(null);
  };

  // Scenario Selection
  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Target className="h-8 w-8 text-emerald-500" />
              Budget Challenge
            </h1>
            <p className="text-gray-500 mt-2">Choose a scenario and test your budgeting skills! AI will evaluate your allocation.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SCENARIOS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setScenario(s); setAllocations({}); setResult(null); }}
                className="bg-white rounded-2xl border border-gray-200 p-6 text-left hover:border-emerald-400 hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-4">{['👩‍💼', '👦', '👧'][i]}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{s.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-600 font-bold">₹{s.budget.toLocaleString()}</span>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Results
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-gradient-to-r from-gray-900 to-emerald-900 rounded-2xl p-8 mb-8 text-white text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
            <div className="text-6xl font-bold mb-2">{result.grade}</div>
            <div className="text-2xl mb-1">Score: {result.overallScore}/100</div>
            <div className="text-emerald-300">+{result.coinsEarned} coins earned!</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">📝 Feedback</h3>
            <p className="text-gray-600">{result.feedback}</p>
          </div>

          {result.categoryFeedback && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Category Scores</h3>
              <div className="space-y-3">
                {result.categoryFeedback.map((cf, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="mr-2">{cf.emoji}</span>
                      <span className="font-medium text-sm">{cf.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${cf.score >= 70 ? 'bg-emerald-500' : cf.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${cf.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-8">{cf.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.tips && (
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">💡 Tips for Improvement</h3>
              <ul className="space-y-2">
                {result.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                    <span>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={reset}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-5 w-5" /> Try Another Scenario
          </button>
        </div>
      </div>
    );
  }

  // Allocation Form
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-gradient-to-r from-gray-900 to-purple-900 rounded-2xl p-8 mb-8 text-white">
          <button onClick={reset} className="text-sm text-gray-400 hover:text-white mb-4">← Back to scenarios</button>
          <h1 className="text-2xl font-bold mb-2">{scenario.title}</h1>
          <p className="text-gray-300 mb-4">{scenario.description}</p>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-400">Budget</p>
              <p className="text-2xl font-bold">₹{scenario.budget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Allocated</p>
              <p className="text-2xl font-bold text-emerald-400">₹{totalAllocated.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Remaining</p>
              <p className={`text-2xl font-bold ${remaining < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                ₹{remaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className="text-2xl">{cat.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 text-sm">{cat.label}</span>
                  <span className="text-xs text-gray-400">Suggested: {cat.suggested}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={scenario.budget}
                  step={scenario.budget <= 10000 ? 100 : 500}
                  value={allocations[cat.key] || 0}
                  onChange={(e) => handleAllocationChange(cat.key, e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
              <div className="w-24 text-right">
                <span className="font-semibold text-gray-900 text-sm">₹{(allocations[cat.key] || 0).toLocaleString()}</span>
                <div className="text-xs text-gray-400">
                  {scenario.budget > 0 ? ((allocations[cat.key] || 0) / scenario.budget * 100).toFixed(0) : 0}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || totalAllocated === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="h-5 w-5" /> Get AI Evaluation
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BudgetChallenge;
