import React, { useState, useEffect, useContext, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import AddChoreModal from './AddChoreModal';
import CompleteChoreModal from './CompleteChoreModal';
import GenerateSecretKeyModal from './GenerateSecretKeyModal';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Key,
  ListChecks,
  Plus,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';
import API_BASE_URL from '../config';

const getReferenceDate = (chore) => new Date(chore.dueDate || chore.dateAdded);

const isSameDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const formatDueDate = (value) =>
  !value
    ? 'No deadline'
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));

const priorityTone = {
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

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
        .then((res) => res.json())
        .then((data) => setChores(data))
        .catch(console.error);
    }
  }, [userId, refreshChores]);

  const today = startOfDay(new Date());
  const todayChores = chores
    .filter((c) => !c.isCompleted && isSameDay(getReferenceDate(c), today))
    .sort((a, b) => getReferenceDate(a) - getReferenceDate(b));
  const missedChores = chores
    .filter((c) => !c.isCompleted && getReferenceDate(c) < today && !isSameDay(getReferenceDate(c), today))
    .sort((a, b) => getReferenceDate(a) - getReferenceDate(b));
  const completedChores = chores.filter((c) => c.isCompleted);

  const totalPotentialCoins = useMemo(
    () => todayChores.reduce((sum, chore) => sum + (chore.addedByParent ? 10 : 5), 0),
    [todayChores]
  );

  const recentCompleted = completedChores.slice(0, 5);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dcfce7,transparent_25%),linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#f8fafc_100%)] py-8">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-[linear-gradient(135deg,#0f172a_0%,#12352a_48%,#0a8f68_100%)] p-8 md:p-10 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_26%)]" />
          <div className="relative grid lg:grid-cols-[1.3fr_0.9fr] gap-8 items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-100 mb-5">
                <Sparkles className="h-3.5 w-3.5" />
                Habit Builder
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight flex items-center gap-3">
                <ListChecks className="h-9 w-9 text-emerald-300" />
                Chore Dashboard
              </h1>
              <p className="text-base md:text-lg text-slate-200 mt-4 max-w-2xl leading-relaxed">
                Turn routine responsibilities into visible momentum. Track daily tasks, recover missed ones, and reward consistency instead of letting chores disappear into the background.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: 'Today\'s coin pool', detail: `${totalPotentialCoins} coins waiting in today’s tasks` },
                { label: 'Complete and recover', detail: 'Finish today’s list and rescue missed chores before they pile up' },
                { label: 'Parent-safe mode', detail: user && user.age < 16 ? 'Secret key tools are ready for parent-managed tasks' : 'Designed for both self-managed and parent-added routines' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="text-sm text-slate-300 mt-1">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 w-full">
            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
              <Clock className="h-5 w-5 text-sky-500 mb-2" />
              <div className="text-2xl font-bold text-stone-900">{todayChores.length}</div>
              <div className="text-xs uppercase tracking-[0.16em] text-stone-400 mt-1">Today</div>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-amber-500 mb-2" />
              <div className="text-2xl font-bold text-stone-900">{missedChores.length}</div>
              <div className="text-xs uppercase tracking-[0.16em] text-stone-400 mt-1">Missed</div>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
              <div className="text-2xl font-bold text-stone-900">{completedChores.length}</div>
              <div className="text-xs uppercase tracking-[0.16em] text-stone-400 mt-1">Completed</div>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
              <Trophy className="h-5 w-5 text-violet-500 mb-2" />
              <div className="text-2xl font-bold text-stone-900">{totalPotentialCoins}</div>
              <div className="text-xs uppercase tracking-[0.16em] text-stone-400 mt-1">Coins Today</div>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {user && user.age < 16 && (
              <button
                onClick={() => setShowSecretKeyModal(true)}
                className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5"
              >
                <Key className="h-4 w-4" /> Secret Key
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add Chore
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_0.9fr] gap-6">
          <div className="space-y-6">
            <section className="rounded-[1.75rem] border border-sky-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_60%,#f8fafc_100%)] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-sky-600 mb-2">Focus Now</p>
                  <h2 className="text-2xl font-bold text-stone-900">Due Today</h2>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-sky-700 border border-sky-100">
                  {todayChores.length} active
                </span>
              </div>

              {todayChores.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-sky-200 bg-white/80 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                    <Star className="h-7 w-7" />
                  </div>
                  <p className="text-xl font-semibold text-stone-900">No chores for today</p>
                  <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto leading-relaxed">
                    Add one small task and let this page become your momentum board instead of an empty list.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayChores.map((chore) => (
                    <div key={chore._id} className="rounded-2xl border border-white bg-white/90 p-4 flex items-center justify-between gap-4 shadow-sm">
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-semibold text-stone-900">{chore.description}</span>
                          {chore.addedByParent && (
                            <span className="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full border border-violet-200">
                              Parent Task
                            </span>
                          )}
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${priorityTone[chore.priority] || priorityTone.Medium}`}>
                            {chore.priority || 'Medium'} Priority
                          </span>
                        </div>
                        <p className="text-sm text-stone-500 mt-1">
                          Reward: +{chore.addedByParent ? 10 : 5} coins. Deadline: {formatDueDate(chore.dueDate)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedChore(chore);
                          setShowCompleteModal(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap"
                      >
                        Complete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {missedChores.length > 0 && (
              <section className="rounded-[1.75rem] border border-amber-100 bg-[linear-gradient(135deg,#fffbeb_0%,#ffffff_70%)] p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-amber-600 mb-2">Recover</p>
                    <h2 className="text-2xl font-bold text-stone-900">Overdue Chores</h2>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-700 border border-amber-100">
                    {missedChores.length} pending
                  </span>
                </div>
                <div className="space-y-3">
                  {missedChores.map((chore) => (
                    <div key={chore._id} className="rounded-2xl border border-amber-100 bg-white p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-stone-900">{chore.description}</p>
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${priorityTone[chore.priority] || priorityTone.Medium}`}>
                            {chore.priority || 'Medium'} Priority
                          </span>
                        </div>
                        <p className="text-sm text-stone-500 mt-1">Deadline passed on {formatDueDate(chore.dueDate || chore.dateAdded)}. Catch this up before it becomes background noise.</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedChore(chore);
                          setShowCompleteModal(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap"
                      >
                        Recover Task
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[1.75rem] border border-emerald-100 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-600 mb-2">Why This Works</p>
              <div className="space-y-3">
                {[
                  'Today tasks keep the routine visible and actionable.',
                  'Missed tasks stop building silent backlog.',
                  'Coin rewards turn consistency into something users can feel immediately.',
                ].map((tip) => (
                  <div key={tip} className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-800">
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500 mb-2">Recent Wins</p>
              <h2 className="text-2xl font-bold text-stone-900 mb-4">Completed</h2>
              {recentCompleted.length === 0 ? (
                <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5 text-sm text-stone-500 text-center">
                  Finish your first chore and your wins will start stacking here.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCompleted.map((chore) => (
                    <div key={chore._id} className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="font-medium text-stone-900 line-through decoration-emerald-400">{chore.description}</p>
                        <p className="text-xs text-stone-500 mt-1">Deadline: {formatDueDate(chore.dueDate)}. Completed and counted toward habit momentum</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>

        {showAddModal && <AddChoreModal onClose={() => setShowAddModal(false)} user={user} refreshChores={setRefreshChores} />}
        {showCompleteModal && <CompleteChoreModal onClose={() => setShowCompleteModal(false)} chore={selectedChore} user={user} refreshChores={setRefreshChores} />}
        {showSecretKeyModal && <GenerateSecretKeyModal onClose={() => setShowSecretKeyModal(false)} user={user} />}
      </div>
    </div>
  );
};

export default ChoreManagement;
