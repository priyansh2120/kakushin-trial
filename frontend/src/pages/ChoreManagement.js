import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import AddChoreModal from './AddChoreModal';
import CompleteChoreModal from './CompleteChoreModal';
import GenerateSecretKeyModal from './GenerateSecretKeyModal';
import { ListChecks, Plus, Key, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import API_BASE_URL from '../config';

const ChoreManagement = () => {
  const [chores, setChores] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSecretKeyModal, setShowSecretKeyModal] = useState(false);
  const [selectedChore, setSelectedChore] = useState(null);
  const [refreshChores, setRefreshChores] = useState(false);
  const { user } = useContext(UserContext);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      fetch(`${API_BASE_URL}/api/chore/${userId}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setChores(data))
        .catch(console.error);
    }
  }, [userId, refreshChores]);

  const todayChores = chores.filter(c => !c.isCompleted && new Date(c.dateAdded).toDateString() === new Date().toDateString());
  const missedChores = chores.filter(c => !c.isCompleted && new Date(c.dateAdded).toDateString() !== new Date().toDateString());
  const completedChores = chores.filter(c => c.isCompleted);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-emerald-500" /> Chore Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">Complete chores to earn virtual currency!</p>
          </div>
          <div className="flex gap-2">
            {user && user.age < 16 && (
              <button onClick={() => setShowSecretKeyModal(true)} className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
                <Key className="h-4 w-4" /> Secret Key
              </button>
            )}
            <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Chore
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <Clock className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900">{todayChores.length}</div>
            <div className="text-xs text-gray-500">Today's Tasks</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900">{missedChores.length}</div>
            <div className="text-xs text-gray-500">Missed</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900">{completedChores.length}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>

        {/* Today's Chores */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Today's Chores
          </h2>
          {todayChores.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">No chores for today. Add one!</div>
          ) : (
            <div className="space-y-2">
              {todayChores.map(chore => (
                <div key={chore._id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <span className="text-gray-900 font-medium">{chore.description}</span>
                    {chore.addedByParent && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Parent Task</span>}
                  </div>
                  <button onClick={() => { setSelectedChore(chore); setShowCompleteModal(true); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium">
                    Complete (+{chore.addedByParent ? 10 : 5} coins)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Missed Chores */}
        {missedChores.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Missed Chores
            </h2>
            <div className="space-y-2">
              {missedChores.map(chore => (
                <div key={chore._id} className="bg-orange-50 rounded-xl border border-orange-200 p-4 flex items-center justify-between">
                  <span className="text-gray-900">{chore.description}</span>
                  <button onClick={() => { setSelectedChore(chore); setShowCompleteModal(true); }}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium">
                    Complete Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedChores.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Completed
            </h2>
            <div className="space-y-2">
              {completedChores.slice(0, 5).map(chore => (
                <div key={chore._id} className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 flex items-center gap-3 opacity-75">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="line-through text-gray-500">{chore.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showAddModal && <AddChoreModal onClose={() => setShowAddModal(false)} user={user} refreshChores={setRefreshChores} />}
        {showCompleteModal && <CompleteChoreModal onClose={() => setShowCompleteModal(false)} chore={selectedChore} user={user} refreshChores={setRefreshChores} />}
        {showSecretKeyModal && <GenerateSecretKeyModal onClose={() => setShowSecretKeyModal(false)} user={user} />}
      </div>
    </div>
  );
};

export default ChoreManagement;
