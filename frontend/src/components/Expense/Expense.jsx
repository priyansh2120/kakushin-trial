import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import ChartComponent from './ChartComponent';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
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

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Expenses</h2>
            <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
          </div>
          <button onClick={toggleModal} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {expenses.map(expense => (
            <div key={expense._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-gray-900">₹{expense.amount}</span>
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">{expense.category}</span>
                  <span className="text-xs text-gray-400">{expense.necessityPercentage}% necessity</span>
                </div>
                {expense.description && <p className="text-xs text-gray-500 mt-0.5">{expense.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(expense)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(expense._id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
          {expenses.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No expenses yet. Start tracking!</p>}
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <ChartComponent title="By Category" data={getCategoryData()} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
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
        <h2 className="text-lg font-bold mb-4">{editExpenseId ? 'Update Expense' : 'Add Expense'}</h2>
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
