import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import ChartComponent from './ChartComponent';
import { Landmark, Pencil, Plus, Sparkles, TrendingUp, Trash2, Wallet2 } from 'lucide-react';
import API_BASE_URL from '../../config';
import 'chart.js/auto';

const IncomePage = () => {
  const [incomes, setIncomes] = useState([]);
  const [formData, setFormData] = useState({ amount: '', source: '', description: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editIncomeId, setEditIncomeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/income/${userId}`, { credentials: 'include' })
      .then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); })
      .then(data => { setIncomes(data); setError(null); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const endpoint = editIncomeId ? `${API_BASE_URL}/api/income/${editIncomeId}` : `${API_BASE_URL}/api/income/add`;
    const method = editIncomeId ? 'PUT' : 'POST';
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, userId }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error); return; }
      if (editIncomeId) {
        setIncomes(incomes.map(inc => (inc._id === editIncomeId ? data : inc)));
        setEditIncomeId(null);
      } else {
        setIncomes([...incomes, data]);
      }
      setFormData({ amount: '', source: '', description: '' });
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to save income');
    }
  };

  const handleEdit = (income) => {
    setFormData({ amount: income.amount, source: income.source, description: income.description });
    setEditIncomeId(income._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    await fetch(`${API_BASE_URL}/api/income/${id}`, { method: 'DELETE', credentials: 'include' });
    setIncomes(incomes.filter(inc => inc._id !== id));
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) { setFormData({ amount: '', source: '', description: '' }); setEditIncomeId(null); }
  };

  const getIncomeChartData = () => {
    const sources = {};
    incomes.forEach(i => { sources[i.source] = (sources[i.source] || 0) + i.amount; });
    return {
      labels: Object.keys(sources),
      datasets: [{ data: Object.values(sources), backgroundColor: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'] }],
    };
  };

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const averageIncome = incomes.length > 0 ? Math.round(totalIncome / incomes.length) : 0;
  const topIncomeSource = Object.entries(
    incomes.reduce((acc, income) => {
      acc[income.source] = (acc[income.source] || 0) + income.amount;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No source yet';

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="bg-white rounded-[1.75rem] border border-emerald-100 p-6 mb-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] overflow-hidden">
        <div className="rounded-[1.5rem] border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_55%,#eff6ff_100%)] p-5 mb-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-600 border border-emerald-100 mb-3">
                <TrendingUp className="h-3.5 w-3.5" />
                Inflow Tracker
              </div>
              <h2 className="text-2xl font-bold text-stone-900">Income</h2>
              <p className="text-4xl font-bold text-emerald-600 mt-2">₹{totalIncome.toLocaleString()}</p>
            </div>
            <button onClick={toggleModal} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" /> Add Income
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/80 border border-white p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Entries</p>
              <p className="text-lg font-semibold text-stone-900 mt-1">{incomes.length}</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-white p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Avg Credit</p>
              <p className="text-lg font-semibold text-stone-900 mt-1">₹{averageIncome.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-white p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Top Source</p>
              <p className="text-sm font-semibold text-stone-900 mt-1 truncate">{topIncomeSource}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-stone-900">Recent income activity</p>
            <p className="text-sm text-stone-500">A clean view of what money is coming in and where it comes from.</p>
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {incomes.map(income => (
            <div key={income._id} className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl hover:bg-stone-100 transition-colors border border-stone-100">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-gray-900">₹{income.amount}</span>
                  <span className="text-xs bg-emerald-100 px-2.5 py-1 rounded-full text-emerald-700 border border-emerald-200">{income.source}</span>
                </div>
                {income.description && <p className="text-xs text-gray-500 mt-0.5">{income.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(income)} className="p-1.5 text-gray-400 hover:text-blue-600"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(income._id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
          {incomes.length === 0 && (
            <div className="rounded-[1.5rem] border border-dashed border-emerald-200 bg-[linear-gradient(135deg,#f0fdf4_0%,#ffffff_100%)] p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Wallet2 className="h-7 w-7" />
              </div>
              <p className="text-xl font-semibold text-stone-900">No income recorded yet</p>
              <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto leading-relaxed">
                Start by logging your first inflow so the dashboard can show how money enters your life, whether it is salary, pocket money, freelance work, or gifts.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                {['Salary', 'Freelance', 'Allowance', 'Gift'].map((item) => (
                  <span key={item} className="rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-medium text-stone-600">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 px-4 py-2 text-xs font-medium border border-sky-100">
                <Landmark className="h-3.5 w-3.5" />
                Add a few sources first to unlock the income mix chart
              </div>
            </div>
          )}
        </div>
      </div>

      {incomes.length > 0 && (
        <div className="bg-white rounded-[1.5rem] border border-stone-200 p-4 shadow-sm">
          <ChartComponent data={getIncomeChartData()} title="Income Sources" />
        </div>
      )}

      <Modal isOpen={isModalOpen} onRequestClose={toggleModal} contentLabel="Income Form"
        className="bg-white p-6 rounded-2xl shadow-xl max-w-md mx-auto mt-20 border border-gray-200"
        overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-start z-50 pt-10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-bold">{editIncomeId ? 'Update Income' : 'Add Income'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="Amount (₹)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
          <input type="text" name="source" value={formData.source} onChange={handleChange} placeholder="Source (Salary, Freelance...)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
          <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium">{editIncomeId ? 'Update' : 'Add'}</button>
            <button type="button" onClick={toggleModal} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IncomePage;
