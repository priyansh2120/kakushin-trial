import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Trophy,
  AlertTriangle,
  TrendingUp,
  Target,
  Brain,
  Bell,
  Shield,
  ChevronRight,
  RefreshCw,
  X,
  TrendingDown,
  Flame,
  Wallet,
} from 'lucide-react';
import { UserContext } from '../contexts/UserContext';
import API_BASE_URL from '../config';

const SEVERITY_STYLES = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-700',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
  critical: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    icon: 'text-rose-500',
    badge: 'bg-rose-100 text-rose-700',
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    icon: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
  },
};

const GRADE_COLORS = {
  'A+': 'text-emerald-500',
  A: 'text-emerald-500',
  'A-': 'text-emerald-500',
  'B+': 'text-teal-500',
  B: 'text-teal-500',
  'B-': 'text-teal-500',
  'C+': 'text-amber-500',
  C: 'text-amber-500',
  'C-': 'text-amber-500',
  'D+': 'text-orange-500',
  D: 'text-orange-500',
  F: 'text-rose-500',
};

const getScoreColor = (score) => {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-teal-500';
  if (score >= 40) return 'text-amber-500';
  return 'text-rose-500';
};

const getStrokeColor = (score) => {
  if (score >= 80) return 'stroke-emerald-500';
  if (score >= 60) return 'stroke-teal-500';
  if (score >= 40) return 'stroke-amber-500';
  return 'stroke-rose-500';
};

const ScoreRing = ({ score, grade }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          className="stroke-gray-200"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          className={`${getStrokeColor(score)} transition-all duration-700`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className={`text-sm font-semibold ${GRADE_COLORS[grade] || 'text-gray-500'}`}>
          {grade}
        </span>
      </div>
    </div>
  );
};

const BreakdownBar = ({ label, score, max }) => {
  const pct = max > 0 ? (score / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 capitalize">{label.replace(/([A-Z])/g, ' $1').trim()}</span>
        <span className="font-medium text-gray-900">
          {score}/{max}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { refreshUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [disciplineScore, setDisciplineScore] = useState(null);
  const [nudges, setNudges] = useState([]);
  const [projection, setProjection] = useState(null);
  const [weeklyInsight, setWeeklyInsight] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/intelligence/dashboard`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load dashboard');
      const data = await res.json();
      setProfile(data.profile || null);
      setDisciplineScore(data.disciplineScore || null);
      setNudges(data.nudges || []);
      setProjection(data.projection || null);
      setWeeklyInsight(data.weeklyInsight || null);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const dismissNudge = async (nudgeId) => {
    setNudges((prev) => prev.filter((n) => n._id !== nudgeId));
    try {
      await fetch(`${API_BASE_URL}/api/intelligence/nudges/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nudgeIds: [nudgeId] }),
      });
    } catch (err) {
      console.error('Error dismissing nudge:', err);
    }
  };

  const refreshProfile = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/intelligence/profile/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        await fetchDashboard();
        refreshUser();
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchDashboard();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const unreadNudges = nudges.filter((n) => !n.read);
  const weekChange = weeklyInsight?.comparedToLastWeek;
  const normalizedRiskLevel = profile?.riskLevel?.toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-emerald-900 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="h-6 w-6 text-cyan-400" />
                SmartLit Dashboard
              </h1>
              <p className="text-gray-300 mt-1">
                Your financial intelligence at a glance
              </p>
            </div>
            <button
              onClick={refreshProfile}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Nudges */}
        {unreadNudges.length > 0 && (
          <div className="space-y-3 mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Nudges
            </h2>
            {unreadNudges.map((nudge) => {
              const style = SEVERITY_STYLES[nudge.severity] || SEVERITY_STYLES.info;
              return (
                <div
                  key={nudge._id}
                  className={`${style.bg} ${style.border} border rounded-xl px-4 py-3 flex items-start justify-between gap-3`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${style.icon}`} />
                    <div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}
                      >
                        {nudge.severity}
                      </span>
                      <p className={`text-sm mt-1 ${style.text}`}>{nudge.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissNudge(nudge._id)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Discipline Score */}
          {disciplineScore && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Discipline Score
              </h2>
              <div className="flex items-center gap-6">
                <ScoreRing score={disciplineScore.total} grade={disciplineScore.grade} />
                <div className="flex-1 space-y-3">
                  {disciplineScore.breakdown &&
                    Object.entries(disciplineScore.breakdown).map(([key, val]) => (
                      <BreakdownBar key={key} label={key} score={val.score} max={val.max} />
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Spending Projection */}
          {projection && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-purple-500" />
                Spending Projection
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Current Spent</span>
                  <span className="font-semibold text-gray-900">
                    ₹{projection.currentSpent?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Projected Monthly</span>
                  <span className="font-semibold text-gray-900">
                    ₹{projection.projectedMonthlySpend?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Budget</span>
                  <span className="font-semibold text-gray-900">
                    ₹{projection.budget?.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Budget bar */}
                <div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        projection.willExceedBudget
                          ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                          : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                      }`}
                      style={{
                        width: `${Math.min(
                          (projection.projectedMonthlySpend / projection.budget) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span>{projection.remainingDays} days left</span>
                    <span>₹{projection.dailyBudgetRemaining?.toLocaleString('en-IN')}/day</span>
                  </div>
                </div>

                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    projection.willExceedBudget
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {projection.message}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Weekly Insight */}
          {weeklyInsight && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Weekly Insight
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Spent This Week</span>
                  <span className="font-semibold text-gray-900">
                    ₹{weeklyInsight.totalSpent?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Top Category</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {weeklyInsight.topCategory}
                  </span>
                </div>

                {weekChange && (
                  <div className="flex items-center gap-2">
                    {weekChange.direction === 'down' ? (
                      <TrendingDown className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-rose-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        weekChange.direction === 'down' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {Math.abs(weekChange.spendingChange)}%{' '}
                      {weekChange.direction === 'down' ? 'less' : 'more'} than last week
                    </span>
                  </div>
                )}

                {weeklyInsight.patterns?.weekendMultiplier && (
                  <div className="text-xs text-gray-500">
                    Weekend spending is{' '}
                    <span className="font-medium text-gray-700">
                      {weeklyInsight.patterns.weekendMultiplier}×
                    </span>{' '}
                    of weekday average
                  </div>
                )}

                {weeklyInsight.suggestions?.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-1">
                    {weeklyInsight.suggestions.map((s, i) => (
                      <p key={i} className="text-sm text-blue-700 flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Profile Summary */}
          {profile && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-indigo-500" />
                Profile Summary
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium">
                    <Flame className="h-4 w-4" />
                    {profile.persona || 'Unknown'}
                  </div>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                      normalizedRiskLevel === 'low'
                        ? 'bg-emerald-50 text-emerald-700'
                        : normalizedRiskLevel === 'medium'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {profile.riskLevel || 'N/A'} risk
                  </div>
                </div>

                {profile.disciplineScore != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Discipline</span>
                    <span className={`font-semibold ${getScoreColor(profile.disciplineScore)}`}>
                      {profile.disciplineScore}
                    </span>
                  </div>
                )}

                {profile.spendingPatterns?.topCategories?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Top Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.spendingPatterns.topCategories.map((cat, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium capitalize"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        {!disciplineScore && !projection && !weeklyInsight && !profile && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Wallet className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">
              No data yet. Start tracking your expenses to unlock insights!
            </p>
            <button
              onClick={refreshProfile}
              disabled={refreshing}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Generate Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
