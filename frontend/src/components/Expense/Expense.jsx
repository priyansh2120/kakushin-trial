import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import ChartComponent from './ChartComponent';
import { AlertTriangle, Pencil, Plus, Sparkles, Trash2, TrendingDown, WalletCards } from 'lucide-react';
import API_BASE_URL from '../../config';
import 'chart.js/auto';

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({ amount: '', category: '', necessityPercentage: '', description: '' });
  const [error, setError] = useState(null);
  const [editExpenseId, setEditExpenseId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      fetch(`${API_BASE_URL}/api/expense/${userId}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setExpenses(data))
        .catch(err => console.error('Error fetching expenses:', err));
    }
  }, [userId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const endpoint = editExpenseId ? `${API_BASE_URL}/api/expense/${editExpenseId}` : `${API_BASE_URL}/api/expense/add`;
    const method = editExpenseId ? 'PUT' : 'POST';
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, userId }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error); return; }
      if (editExpenseId) {
        setExpenses(expenses.map(exp => (exp._id === editExpenseId ? data : exp)));
        setEditExpenseId(null);
      } else {
        setExpenses([...expenses, data]);
      }
      setFormData({ amount: '', category: '', necessityPercentage: '', description: '' });
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    setFormData({ amount: expense.amount, category: expense.category, necessityPercentage: expense.necessityPercentage, description: expense.description });
    setEditExpenseId(expense._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    await fetch(`${API_BASE_URL}/api/expense/${id}`, { method: 'DELETE', credentials: 'include' });
    setExpenses(expenses.filter(exp => exp._id !== id));
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) { setFormData({ amount: '', category: '', necessityPercentage: '', description: '' }); setEditExpenseId(null); }
  };

  const getCategoryData = () => {
    const categoryData = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    return {
      labels: Object.keys(categoryData),
      datasets: [{ data: Object.values(categoryData), backgroundColor: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'] }],
    };
  };

  const getNecessityData = () => {
    const data = { Necessary: 0, Unnecessary: 0 };
    expenses.forEach(e => { data[e.necessityPercentage > 50 ? 'Necessary' : 'Unnecessary'] += e.amount; });
    return {
      labels: ['Necessary', 'Unnecessary'],
      datasets: [{ data: [data.Necessary, data.Unnecessary], backgroundColor: ['#10b981', '#ef4444'] }],
    };
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const averageExpense = expenses.length > 0 ? Math.round(totalExpenses / expenses.length) : 0;
  const topExpenseCategory = Object.entries(
    expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No category yet';

  return (
    <div>
      <div className="bg-white rounded-[1.75rem] border border-rose-100 p-6 mb-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] overflow-hidden">
        <div className="rounded-[1.5rem] border border-rose-100 bg-[linear-gradient(135deg,#fff1f2_0%,#ffffff_55%,#fff7ed_100%)] p-5 mb-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-rose-500 border border-rose-100 mb-3">
                <TrendingDown className="h-3.5 w-3.5" />
                Outflow Tracker
              </div>
              <h2 className="text-2xl font-bold text-stone-900">Expenses</h2>
              <p className="text-4xl font-bold text-rose-600 mt-2">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <button onClick={toggleModal} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" /> Add Expense
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/80 border border-white p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Entries</p>
              <p className="text-lg font-semibold text-stone-900 mt-1">{expenses.length}</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-white p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Avg Ticket</p>
              <p className="text-lg font-semibold text-stone-900 mt-1">₹{averageExpense.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-white p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Top Category</p>
              <p className="text-sm font-semibold text-stone-900 mt-1 truncate">{topExpenseCategory}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-stone-900">Recent expense activity</p>
            <p className="text-sm text-stone-500">Your latest money-out moments, from essentials to impulse buys.</p>
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {expenses.map(expense => (
            <div key={expense._id} className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl hover:bg-stone-100 transition-colors border border-stone-100">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-gray-900">₹{expense.amount}</span>
                  <span className="text-xs bg-white px-2.5 py-1 rounded-full text-gray-600 border border-stone-200">{expense.category}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    expense.necessityPercentage > 50
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {expense.necessityPercentage}% necessity
                  </span>
                </div>
                {expense.description && <p className="text-xs text-gray-500 mt-0.5">{expense.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(expense)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(expense._id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="rounded-[1.5rem] border border-dashed border-rose-200 bg-[linear-gradient(135deg,#fffafb_0%,#ffffff_100%)] p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
                <WalletCards className="h-7 w-7" />
              </div>
              <p className="text-xl font-semibold text-stone-900">No expenses tracked yet</p>
              <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto leading-relaxed">
                Start with one real purchase today. Even a chai, bus ticket, or grocery item gives your dashboard something honest to learn from.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                {['Food', 'Transport', 'Bills', 'Shopping'].map((item) => (
                  <span key={item} className="rounded-full border border-rose-100 bg-white px-3 py-1 text-xs font-medium text-stone-600">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-700 px-4 py-2 text-xs font-medium border border-amber-100">
                <AlertTriangle className="h-3.5 w-3.5" />
                Track a few entries first to unlock category and necessity charts
              </div>
            </div>
          )}
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[1.5rem] border border-stone-200 p-4 shadow-sm">
            <ChartComponent title="By Category" data={getCategoryData()} />
          </div>
          <div className="bg-white rounded-[1.5rem] border border-stone-200 p-4 shadow-sm">
            <ChartComponent title="Necessity" data={getNecessityData()} />
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={toggleModal}
        contentLabel="Expense Form"
        className="bg-white p-6 rounded-2xl shadow-xl max-w-md mx-auto mt-20 border border-gray-200"
        overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-start z-50 pt-10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-bold">{editExpenseId ? 'Update Expense' : 'Add Expense'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="Amount (₹)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
          <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category (Food, Transport...)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
          <input type="number" name="necessityPercentage" value={formData.necessityPercentage} onChange={handleChange} placeholder="Necessity % (0-100)" min="0" max="100" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
          <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium">{editExpenseId ? 'Update' : 'Add'}</button>
            <button type="button" onClick={toggleModal} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpensePage;
