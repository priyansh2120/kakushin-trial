import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Flame, CheckCircle2, Gift, Zap, Trophy, Lock } from 'lucide-react';
import API_BASE_URL from '../config';

const DailyMissions = () => {
  const [missions, setMissions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalMissions, setTotalMissions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [claimingMission, setClaimingMission] = useState(null);
  const { refreshUser } = useContext(UserContext);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/missions/daily`, {
        credentials: 'include',
      });
      const data = await res.json();
      setMissions(data.missions || []);
      setStreak(data.streak || 0);
      setCompletedCount(data.completedCount || 0);
      setTotalMissions(data.totalMissions || 0);
    } catch (err) {
      console.error('Error fetching missions:', err);
    } finally {
      setLoading(false);
    }
  };

  const completeMission = async (missionKey) => {
    try {
      setActionMessage(null);
      setClaimingMission(missionKey);
      const res = await fetch(`${API_BASE_URL}/api/missions/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ missionKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage({
          type: 'error',
          text: data.error || 'Mission cannot be claimed yet.',
        });
        return;
      }

      if (data.success) {
        setActionMessage({
          type: 'success',
          text: 'Mission reward claimed successfully.',
        });
        await fetchMissions();
        refreshUser();
      }
    } catch (err) {
      console.error('Error completing mission:', err);
      setActionMessage({
        type: 'error',
        text: 'Unable to claim this mission right now.',
      });
    } finally {
      setClaimingMission(null);
    }
  };

  const progressPercent = totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-emerald-900 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-400" />
                Daily Missions
              </h1>
              <p className="text-gray-300 mt-1">Complete missions to earn coins and build your streak!</p>
            </div>
            <div className="text-center bg-white/10 rounded-xl px-6 py-3">
              <div className="flex items-center gap-1">
                <Flame className="h-6 w-6 text-orange-400" />
                <span className="text-3xl font-bold">{streak}</span>
              </div>
              <p className="text-xs text-gray-300">Day Streak</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/10 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-300">
            <span>{completedCount}/{totalMissions} completed</span>
            {completedCount >= totalMissions && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Trophy className="h-4 w-4" /> All done! +{Math.min(streak * 2, 20)} streak bonus
              </span>
            )}
          </div>
        </div>

        {/* Missions List */}
        <div className="space-y-4">
          {actionMessage && (
            <div className={`rounded-xl border px-4 py-3 text-sm ${
              actionMessage.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}>
              {actionMessage.text}
            </div>
          )}

          {missions.map((mission) => (
            <div
              key={mission.key}
              className={`bg-white rounded-xl border p-5 transition-all ${
                mission.completed
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{mission.icon}</div>
                  <div>
                    <h3 className={`font-semibold ${mission.completed ? 'text-emerald-700' : 'text-gray-900'}`}>
                      {mission.title}
                    </h3>
                    <p className="text-sm text-gray-500">{mission.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                    <Gift className="h-3.5 w-3.5" />
                    +{mission.reward}
                  </div>
                  {mission.completed ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  ) : mission.canClaim ? (
                    <button
                      onClick={() => completeMission(mission.key)}
                      disabled={claimingMission === mission.key}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {claimingMission === mission.key ? 'Claiming...' : 'Claim'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500">
                      <Lock className="h-4 w-4" />
                      Locked
                    </div>
                  )}
                </div>
              </div>

              {!mission.completed && !mission.canClaim && (
                <p className="mt-3 pl-[3.25rem] text-sm text-stone-500">
                  {mission.eligibilityReason || 'Complete the mission activity today to unlock this reward.'}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Complete all 5 missions daily to build your streak</li>
            <li>• Streak bonuses increase each day (up to +20 coins)</li>
            <li>• Use the AI chatbot to complete the "Ask the AI" mission</li>
            <li>• Missions reset every day at midnight</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DailyMissions;
