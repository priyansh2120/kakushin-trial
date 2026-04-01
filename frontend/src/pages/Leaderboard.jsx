import React, { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Star } from "lucide-react";
import API_BASE_URL from "../config";

export const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/extras/alluser/search`);
        const data = await response.json();
        data.sort((a, b) => b.virtualCurrency - a.virtualCurrency);
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-500 mt-1">Top SmartLit users ranked by virtual currency</p>
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
                <div className={`text-xs ${rank === 0 ? 'text-yellow-500' : 'text-gray-500'}`}>{users[rank].virtualCurrency} coins</div>
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
              <div className="flex-1">
                <div className={`font-semibold text-sm ${index <= 2 ? '' : 'text-gray-900'}`}>{user.username}</div>
                <div className={`text-xs ${index <= 2 ? 'opacity-75' : 'text-gray-500'}`}>{user.profession} • Literacy: {user.financialLiteracy}</div>
              </div>
              <div className={`font-bold ${index <= 2 ? '' : 'text-emerald-600'}`}>
                {user.virtualCurrency} <span className="text-xs font-normal">coins</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
