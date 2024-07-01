import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

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

  const userId = localStorage.getItem("userId");
  console.log("usr id is slkjjlkfjlj ",userId)

  useEffect(() => {
    fetch(`http://localhost:5000/api/expense/${userId}`)
      .then(response => response.json())
      .then(data => setExpenses(data))
      .catch(error => console.error('Error fetching expenses:', error));
  }, [userId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>
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
      <button onClick={toggleModal} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        Add Expense
      </button>

      <Modal isOpen={isModalOpen} onRequestClose={toggleModal} contentLabel="Expense Form">
        <h2 className="text-xl font-bold mb-4">{editExpenseId ? 'Update Expense' : 'Add Expense'}</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <label className="block mb-2">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Necessity Percentage</label>
            <input
              type="number"
              name="necessityPercentage"
              value={formData.necessityPercentage}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Description</label>
            <input
              type="text"
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
    </div>
  );
};

export default ExpensePage;
