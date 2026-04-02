import React, { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Star, Flame, TrendingUp } from "lucide-react";
import API_BASE_URL from "../config";

export const Leaderboard = () => {
  const [tab, setTab] = useState("smart");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        if (tab === "smart") {
          const response = await fetch(`${API_BASE_URL}/api/intelligence/leaderboard`);
          const data = await response.json();
          setUsers(data);
        } else {
          const response = await fetch(`${API_BASE_URL}/api/extras/alluser/search`);
          const data = await response.json();
          data.sort((a, b) => b.virtualCurrency - a.virtualCurrency);
          setUsers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [tab]);

  const getRankStyle = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
    if (index === 2) return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
    return 'bg-white';
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="h-6 w-6 text-yellow-300" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-200" />;
    if (index === 2) return <Medal className="h-6 w-6 text-orange-300" />;
    return <span className="text-sm font-bold text-gray-400">#{index + 1}</span>;
  };

  const getDisciplineColor = (score) => {
    if (score >= 80) return 'from-emerald-400 to-cyan-400';
    if (score >= 50) return 'from-yellow-400 to-amber-400';
    return 'from-red-400 to-orange-400';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-500 mt-1">
            {tab === "smart"
              ? "Smart ranking based on discipline, streaks & improvement"
              : "Top SmartLit users ranked by virtual currency"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl bg-gray-200 p-1">
            <button
              onClick={() => setTab("smart")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "smart"
                  ? "bg-white text-emerald-700 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Star className="h-4 w-4 inline-block mr-1 -mt-0.5" />
              Smart Ranking
            </button>
            <button
              onClick={() => setTab("classic")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "classic"
                  ? "bg-white text-emerald-700 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Trophy className="h-4 w-4 inline-block mr-1 -mt-0.5" />
              Classic
            </button>
          </div>
        </div>

        {/* Top 3 Podium */}
        {users.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-10">
            {[1, 0, 2].map((rank) => (
              <div key={rank} className={`text-center ${rank === 0 ? 'mb-4' : ''}`}>
                <img src={users[rank].profilePictureUrl} alt="" className={`rounded-full mx-auto mb-2 ring-4 ${
                  rank === 0 ? 'w-20 h-20 ring-yellow-400' : 'w-16 h-16 ring-gray-300'
                }`} />
                <div className={`font-bold text-sm ${rank === 0 ? 'text-yellow-600' : 'text-gray-700'}`}>{users[rank].username}</div>
                <div className={`text-xs ${rank === 0 ? 'text-yellow-500' : 'text-gray-500'}`}>
                  {tab === "smart" ? `${users[rank].rankScore} pts` : `${users[rank].virtualCurrency} coins`}
                </div>
                <div className={`mt-2 inline-flex items-center justify-center w-8 h-8 rounded-full ${
                  rank === 0 ? 'bg-yellow-400 text-white' : rank === 1 ? 'bg-gray-300' : 'bg-orange-400 text-white'
                } font-bold text-sm`}>
                  {rank + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Full List */}
        <div className="space-y-2">
          {users.map((user, index) => (
            <div key={user._id} className={`rounded-xl p-4 flex items-center gap-4 ${getRankStyle(index)} ${index > 2 ? 'border border-gray-200' : ''}`}>
              <div className="w-8 text-center">{getRankIcon(index)}</div>
              <img src={user.profilePictureUrl} alt="" className="w-10 h-10 rounded-full" />
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm ${index <= 2 ? '' : 'text-gray-900'}`}>{user.username}</div>
                <div className={`text-xs ${index <= 2 ? 'opacity-75' : 'text-gray-500'}`}>{user.profession} • Literacy: {user.financialLiteracy}</div>

                {tab === "smart" && (
                  <div className="flex items-center gap-3 mt-2">
                    {/* Discipline Score Bar */}
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className={`text-xs font-medium whitespace-nowrap ${index <= 2 ? 'opacity-90' : 'text-gray-600'}`}>Discipline</span>
                      <div className={`flex-1 h-2 rounded-full ${index <= 2 ? 'bg-white/30' : 'bg-gray-200'}`}>
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${getDisciplineColor(user.disciplineScore)}`}
                          style={{ width: `${Math.min(user.disciplineScore, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold whitespace-nowrap ${index <= 2 ? '' : 'text-gray-700'}`}>{user.disciplineScore}</span>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-0.5" title={`${user.streak} day streak`}>
                      <Flame className={`h-4 w-4 ${user.streak > 0 ? 'text-orange-500' : index <= 2 ? 'opacity-40' : 'text-gray-300'}`} />
                      <span className={`text-xs font-bold ${index <= 2 ? '' : 'text-gray-700'}`}>{user.streak}</span>
                    </div>

                    {/* Improvement */}
                    <div className="flex items-center gap-0.5" title={`${user.improvement}% improvement`}>
                      <TrendingUp className={`h-4 w-4 ${user.improvement > 0 ? 'text-emerald-500' : index <= 2 ? 'opacity-40' : 'text-gray-400'}`} />
                      <span className={`text-xs font-bold ${
                        user.improvement > 0
                          ? (index <= 2 ? '' : 'text-emerald-600')
                          : (index <= 2 ? 'opacity-60' : 'text-gray-400')
                      }`}>
                        {user.improvement > 0 ? '+' : ''}{user.improvement}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className={`font-bold text-right ${index <= 2 ? '' : 'text-emerald-600'}`}>
                {tab === "smart" ? (
                  <>
                    {user.rankScore} <span className="text-xs font-normal">pts</span>
                  </>
                ) : (
                  <>
                    {user.virtualCurrency} <span className="text-xs font-normal">coins</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
