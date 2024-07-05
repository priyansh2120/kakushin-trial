import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import ChartComponent from './ChartComponent'; // Import your newly created ChartComponent
import 'chart.js/auto'; // Ensure Chart.js auto-registers components

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    necessityPercentage: '',
    description: '',
  });
  const [error, setError] = useState(null);
  const [editExpenseId, setEditExpenseId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:5000/api/expense/${userId}`)
        .then(response => response.json())
        .then(data => setExpenses(data))
        .catch(error => console.error('Error fetching expenses:', error));
    }
  }, [userId]);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const endpoint = editExpenseId ? `http://localhost:5000/api/expense/${editExpenseId}` : 'http://localhost:5000/api/expense/add';
    const method = editExpenseId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      if (editExpenseId) {
        setExpenses(expenses.map(exp => (exp._id === editExpenseId ? data : exp)));
        setEditExpenseId(null);
      } else {
        setExpenses([...expenses, data]);
      }

      setFormData({
        amount: '',
        category: '',
        necessityPercentage: '',
        description: '',
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding/updating expense:', error);
      setError('Internal Server Error');
    }
  };

  // Handle edit expense
  const handleEdit = (expense) => {
    setFormData({
      amount: expense.amount,
      category: expense.category,
      necessityPercentage: expense.necessityPercentage,
      description: expense.description,
    });
    setEditExpenseId(expense._id);
    setIsModalOpen(true);
  };

  // Handle delete expense
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/expense/${id}`, {
        method: 'DELETE',
      });

      setExpenses(expenses.filter(exp => exp._id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Toggle modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      setFormData({
        amount: '',
        category: '',
        necessityPercentage: '',
        description: '',
      });
      setEditExpenseId(null);
    }
  };

  // Prepare data for pie chart by category
  const getCategoryData = () => {
    const categoryData = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    return {
      labels: Object.keys(categoryData),
      datasets: [
        {
          data: Object.values(categoryData),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        },
      ],
    };
  };

  // Prepare data for pie chart by necessity
  const getNecessityData = () => {
    const necessityData = { Necessary: 0, Unnecessary: 0 };

    expenses.forEach(expense => {
      if (expense.necessityPercentage > 50) {
        necessityData.Necessary += expense.amount;
      } else {
        necessityData.Unnecessary += expense.amount;
      }
    });

    return {
      labels: ['Necessary', 'Unnecessary'],
      datasets: [
        {
          data: [necessityData.Necessary, necessityData.Unnecessary],
          backgroundColor: ['#FF6384', '#36A2EB'],
        },
      ],
    };
  };

  return (
    <div>
      <h1 className="text-6xl font-extralight my-6">Expenses</h1>
      <div>
        <h2 className="text-xl font-bold mb-4">Your Expenses</h2>
        <ul>
          {expenses.map(expense => (
            <li key={expense._id} className="mb-4 p-4 border border-gray-300 rounded">
              <div className="flex justify-between items-center">
                <button
                  className="flex-grow text-left"
                  onClick={() => setExpenses(expenses.map(exp => exp._id === expense._id ? { ...exp, expanded: !exp.expanded } : exp))}
                >
                  <div className="flex justify-between items-center">
                    <span className="flex-1">Amount: {expense.amount}</span>
                    <span className="flex-1">Category: {expense.category}</span>
                    <span className="flex-1">Necessity Percentage: {expense.necessityPercentage}</span>
                  </div>
                </button>
                <div className="flex">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                    onClick={() => handleEdit(expense)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(expense._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {expense.expanded && (
                <div className="mt-2">
                  <p>Description: {expense.description}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <button onClick={toggleModal} className="bg-blue-400 text-white px-4 py-2 rounded mb-4">
        Add Expense
      </button>

      <Modal isOpen={isModalOpen} onRequestClose={toggleModal} contentLabel="Expense Form">
        <h2 className="text-xl font-bold mb-4">{editExpenseId ? 'Update Expense' : 'Add Expense'}</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <label htmlFor="amount" className="block mb-2">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block mb-2">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="necessityPercentage" className="block mb-2">Necessity Percentage</label>
            <input
              type="number"
              id="necessityPercentage"
              name="necessityPercentage"
              value={formData.necessityPercentage}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block mb-2">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editExpenseId ? 'Update Expense' : 'Add Expense'}
          </button>
        </form>
        <button onClick={toggleModal} className="bg-gray-500 text-white px-4 py-2 rounded">
          Close
        </button>
      </Modal>

      <ChartComponent title="Expenses by Category" data={getCategoryData()} />
      <ChartComponent title="Necessary vs Unnecessary Expenses" data={getNecessityData()} />
    </div>
  );
};

export default ExpensePage;
