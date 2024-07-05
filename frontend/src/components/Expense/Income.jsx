import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto'; // Importing this ensures Chart.js auto-registers components
import ChartComponent from './ChartComponent';

const IncomePage = () => {
  const [incomes, setIncomes] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    description: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editIncomeId, setEditIncomeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetch(`http://localhost:5000/api/income/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setIncomes(data);
        setError(null); // Clear any previous error
      })
      .catch(error => {
        console.error('Error fetching incomes:', error);
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
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

    const endpoint = editIncomeId ? `http://localhost:5000/api/income/${editIncomeId}` : 'http://localhost:5000/api/income/add';
    const method = editIncomeId ? 'PUT' : 'POST';

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

      if (editIncomeId) {
        setIncomes(incomes.map(inc => (inc._id === editIncomeId ? data : inc)));
        setEditIncomeId(null);
      } else {
        setIncomes([...incomes, data]);
      }

      setFormData({
        amount: '',
        source: '',
        description: '',
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding/updating income:', error);
      setError('Internal Server Error');
    }
  };

  const handleEdit = (income) => {
    setFormData({
      amount: income.amount,
      source: income.source,
      description: income.description,
    });
    setEditIncomeId(income._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/income/${id}`, {
        method: 'DELETE',
      });

      setIncomes(incomes.filter(inc => inc._id !== id));
      setLoading(false)
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      setFormData({
        amount: '',
        source: '',
        description: '',
      });
      setEditIncomeId(null);
    }
  };

  const getIncomeChartData = () => {
    // Group incomes by source
    const incomeBySource = incomes.reduce((acc, income) => {
      if (acc[income.source]) {
        acc[income.source] += income.amount;
      } else {
        acc[income.source] = income.amount;
      }
      return acc;
    }, {});

    // Calculate total income
    const incomeTotal = Object.values(incomeBySource).reduce((total, amount) => total + amount, 0);

    // Create data array
    const data = Object.keys(incomeBySource).map(source => ({
      label: source,
      value: (incomeBySource[source] / incomeTotal) * 100,
    }));

    return {
      labels: data.map(item => item.label),
      datasets: [
        {
          data: data.map(item => item.value.toFixed(2)),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        },
      ],
    };
  };

  return loading ? <>Loading...</> : (
    <div>
      <h1 className="text-6xl font-extralight  my-6">Incomes</h1>
      <div>
        <h2 className="text-xl font-bold mb-4">Your Incomes</h2>
        <ul>
          {incomes.map(income => (
            <li key={income._id} className="mb-4 p-4 border border-gray-300 rounded">
              <div className="flex justify-between items-center">
                <button
                  className="flex-grow text-left"
                  onClick={() => setIncomes(incomes.map(inc => inc._id === income._id ? { ...inc, expanded: !inc.expanded } : inc))}
                >
                  <div className="flex justify-between items-center">
                    <span className="flex-1">Amount: {income.amount}</span>
                    <span className="flex-1">Source: {income.source}</span>
                  </div>
                </button>
                <div className="flex">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                    onClick={() => handleEdit(income)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(income._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {income.expanded && (
                <div className="mt-2">
                  <p>Description: {income.description}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <button onClick={toggleModal} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        Add Income
      </button>

      <Modal isOpen={isModalOpen} onRequestClose={toggleModal} contentLabel="Income Form">
        <h2 className="text-xl font-bold mb-4">{editIncomeId ? 'Update Income' : 'Add Income'}</h2>
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
            <label className="block mb-2">Source</label>
            <input
              type="text"
              name="source"
              value={formData.source}
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
            {editIncomeId ? 'Update Income' : 'Add Income'}
          </button>
        </form>
        <button onClick={toggleModal} className="bg-gray-500 text-white px-4 py-2 rounded">
          Close
        </button>
      </Modal>

      <div className="mt-8">
        <ChartComponent data={getIncomeChartData()} title="Income Distribution" />
      </div>
    </div>
  );
};

export default IncomePage;
