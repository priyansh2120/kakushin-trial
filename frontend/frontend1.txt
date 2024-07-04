frontend:

public :
index.html

    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <!--
      manifest.json provides metadata used when your web app is installed on a
      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
    -->
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <!--
      Notice the use of %PUBLIC_URL% in the tags above.
      It will be replaced with the URL of the `public` folder during the build.
      Only files inside the `public` folder can be referenced from the HTML.

      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running `npm run build`.
    -->
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <!--
      This HTML file is a template.
      If you open it directly in the browser, you will see an empty page.

      You can add webfonts, meta tags, or analytics to this file.
      The build step will place the bundled scripts into the <body> tag.

      To begin the development, run `npm start` or `yarn start`.
      To create a production bundle, use `npm run build` or `yarn build`.
    -->
  </body>
</html>


          src

              components

                  expense

                      chartcomponent.jsx

                          import React from "react";
import { Pie } from "react-chartjs-2";

const ChartComponent = ({ data, title }) => {
  // Custom options to adjust the size of the Pie chart
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // This ensures the chart fits within its container
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
        <Pie data={data} options={chartOptions} />
      </div>
    </div>
  );
};

export default ChartComponent;

expense.jsx:


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


expensepage.jsx:

import React from 'react'
import Expense from "./Expense";
import IncomePage from './Income';

const ExpensePage = () => {
  return (
    <div className='flex justify-center space-x-40'>
      <Expense/>
      <IncomePage/>
    </div>
  )
}

export default ExpensePage


    income.jsx

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
    const incomeTotal = incomes.reduce((total, income) => total + income.amount, 0);
    const data = incomes.map(income => ({
      label: income.source,
      value: (income.amount / incomeTotal) * 100,
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

  return loading?<> Loading...</>:(
    <div>
      <h1 className="text-2xl font-bold mb-4">Incomes</h1>
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
        <ChartComponent data ={getIncomeChartData()} title="Income Distribution" />
      </div>
    </div>
  );
};

export default IncomePage;


export.js

    import ExpensePage from "./ExpensePage";

export { ExpensePage}


Landing

    customerreview.jsx
        import React from 'react';

const CustomerReview = () => {
  return (
    <div className="flex items-center justify-center bg-gray-800 text-white p-10 m-5 rounded-md">
      <div className="flex flex-col items-center">
        <div className="text-3xl font-bold mb-2">100k</div>
        <div className="text-xl">satisfied customers</div>
      </div>
    </div>
  );
}

export default CustomerReview;

features.jsx

    import React from 'react';

const FeaturesSection = () => {
  return (
    <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-10 m-5 rounded-md">
      <div className="max-w-7xl mx-auto flex flex-col items-start">
        <h2 className="text-3xl font-bold mb-6">Save money and become carbon neutral with Finlit</h2>
        <button className="bg-green-500 px-6 py-3 rounded-full text-xl font-semibold">Explore all features</button>
      </div>
    </div>
  );
}

export default FeaturesSection;

herosection.jsx

    
import React from 'react';

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-10 m-5 rounded-md">
      <div className="max-w-7xl mx-auto flex flex-col items-start">
        <h1 className="text-5xl font-bold mb-6">Building financial security easy as playing a game!</h1>
        <div>
          <button className="bg-green-500 px-6 py-3 rounded-full text-xl font-semibold mr-4">See video</button>
          <button className="bg-blue-500 px-6 py-3 rounded-full text-xl font-semibold">Try now</button>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;


landing.jsx


    import React from "react";
import Navbar from "../Navbar";
import HeroSection from './HeroSection';
import CustomerReview from './CustomerReview';
import FeaturesSection from './Features';

const Landing = () => {
  return (
    <>
    <div className="flex bg-gradient-to-r from-gray-600 to-gray-800 h-lvh">
      <div className="flex-1">

      <HeroSection />
      <div className="flex w-full justify-around">

      <CustomerReview />
      <FeaturesSection />
      </div>
      </div>
      <div className="flex-1 text-8xl">Chatbot</div>
    </div>
    </>
  );
};

export default Landing;


login.jsx


    import React, { useEffect, useState } from 'react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState(null);

  useEffect(()=> {
    const userId = localStorage.getItem('userId');
    if (userId) {
      // Redirect to the dashboard
      window.location.href = '/expense';
    }
  }, []
  );


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials:'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }
      localStorage.setItem('userId', data._id);
      // setUser(data);
      // Handle successful login (e.g., redirect or show a success message)
      console.log('Login successful', data);
      
      window.location.reload();
    } catch (error) {
      console.error('Error during login', error);
      setError('Internal Server Error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;


navbar.js

    import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

const Navbar = () => {
  const { user, loading, error } = useContext(UserContext);

  return (
    <nav className="flex justify-between items-center p-6 bg-gray-900 text-white">
      <div className="text-xl font-bold">Finlet</div>
      <ul className="flex space-x-6">
        <li>
          <Link to="/expense">Expense Tracker</Link>
        </li>
        <li>
          <Link to="/">Recommendation</Link>
        </li>
        <li>
          <Link to="/">Chatbot</Link>
        </li>
        {loading ? (
          <li>Loading...</li>
        ) : error ? (
          <li>Error loading user data</li>
        ) : user ? (
          <li>Currency: {user.virtualCurrency}</li>
        ) : (
          <>
            <li>
              <Link to="/signup" className="bg-green-500 px-4 py-2 rounded">Sign up</Link>
            </li>
            <li>
              <Link to ="/login" className="bg-green-500 px-4 py-2 rounded">Login</Link>
            </li>
          </>
        )}
        {user && (
          <li>
            <Link onClick={()=>{
                localStorage.removeItem('userId');
                window.location.href = '/';
            }} className="bg-red-500 px-4 py-2 rounded">Logout</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

quiz.jsx


    import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from "../contexts/UserContext";
import Modal from 'react-modal';

// Set the app element for accessibility purposes
Modal.setAppElement('#root');

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetch('http://localhost:5000/api/quiz/questions')
      .then(response => response.json())
      .then(data => {
        setQuestions(data[0].questions);
      })
      .catch(error => {
        console.error('There was an error fetching the questions!', error);
      });
  }, []);

  const handleOptionChange = (questionIndex, option) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionIndex]: option,
    }));
  };

  const handleSubmit = () => {
    const results = questions.map((question, index) => ({
      question: question.question,
      correctAnswer: question.correctAnswer,
      userAnswer: userAnswers[index] || '',
      isCorrect: question.correctAnswer === (userAnswers[index] || ''),
    }));

    const score = results.reduce((acc, result) => acc + (result.isCorrect ? 1 : 0), 0);

    setResults({ score, results });

    fetch('http://localhost:5000/api/quiz/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ results, score, userId: user._id }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Results submitted successfully:', data);
      })
      .catch(error => {
        console.error('There was an error submitting the results!', error);
      });
  };

  const closeModal = () => {
    setResults(null);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 text-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Quiz</h1>
      {questions.map((question, index) => (
        <div key={index} className="mb-6">
          <h2 className="text-xl mb-2">{question.question}</h2>
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option, idx) => {
              const isSelected = userAnswers[index] === option;
              const optionBg = isSelected ? 'bg-blue-300' : 'bg-gray-200';
              const optionText = isSelected ? 'text-white' : 'text-black';

              return (
                <div key={idx} className={`p-4 rounded ${optionBg} ${optionText}`}>
                  <label className="cursor-pointer flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      onChange={() => handleOptionChange(index, option)}
                      className="mr-2"
                      checked={isSelected}
                    />
                    {option}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <button
        className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
        onClick={handleSubmit}
      >
        Submit
      </button>
      {results && (
        <Modal
          isOpen={!!results}
          onRequestClose={closeModal}
          contentLabel="Results Modal"
          className="bg-white p-8 rounded shadow-lg mx-auto my-4 max-w-2xl"
          overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center"
        >
          <h2 className="text-2xl font-bold">Your Score: {results.score} / {questions.length}</h2>
          <ul className="mt-4">
            {results.results.map((result, index) => (
              <li key={index} className="mb-2">
                <p className="text-lg">{result.question}</p>
                <p className={`text-sm ${result.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                  Your answer: {result.userAnswer} (Correct answer: {result.correctAnswer})
                </p>
              </li>
            ))}
          </ul>
          <button
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
            onClick={closeModal}
          >
            Close
          </button>
        </Modal>
      )}
    </div>
  );
};

export default Quiz;
