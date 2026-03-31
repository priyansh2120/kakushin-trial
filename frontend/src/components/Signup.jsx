import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { Brain, UserPlus } from 'lucide-react';
import API_BASE_URL from '../config';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '', username: '', password: '', confirmPassword: '',
    gender: '', age: '', profession: '', income: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/expense');
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }

      localStorage.setItem('userId', data._id);
      refreshUser();
      navigate('/expense');
    } catch (error) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-500 text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Brain className="h-10 w-10 text-emerald-400" />
            <span className="text-2xl font-bold text-white">Smart<span className="text-emerald-400">Lit</span></span>
          </Link>
          <p className="text-gray-400 mt-2">Create your account and start your financial journey</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="Your name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className={inputClass} placeholder="Choose username" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="Create password" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass} placeholder="Confirm password" required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass} required>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className={inputClass} placeholder="Age" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Profession</label>
                <select name="profession" value={formData.profession} onChange={handleChange} className={inputClass} required>
                  <option value="">Select</option>
                  <option value="Student">Student</option>
                  <option value="Job">Working</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Monthly Income (₹)</label>
              <input type="number" name="income" value={formData.income} onChange={handleChange} className={inputClass} placeholder="Enter monthly income" required />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
