import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, BarChart3, RefreshCw } from 'lucide-react';
import API_BASE_URL from '../config';

const StockSimulator = () => {
  const [marketData, setMarketData] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [shares, setShares] = useState(1);
  const [tab, setTab] = useState('market');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { refreshUser } = useContext(UserContext);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchMarketData(), fetchPortfolio()]);
    setLoading(false);
  };

  const fetchMarketData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/games/stocks/market`, { credentials: 'include' });
      const data = await res.json();
      setMarketData(data);
    } catch (err) {
      console.error('Error fetching market data:', err);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/games/stocks/portfolio`, { credentials: 'include' });
      const data = await res.json();
      setPortfolio(data);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    }
  };

  const handleTrade = async (type) => {
    if (!selectedStock || shares <= 0) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/games/stocks/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ symbol: selectedStock.symbol, shares }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchPortfolio();
        refreshUser();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Trade failed' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <BarChart3 className="h-6 w-6 text-cyan-400" />
            Stock Market Simulator
          </h1>
          <p className="text-gray-300 mb-6">Practice investing with virtual ₹1,00,000. Learn without risk!</p>

          {portfolio && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-400">Cash Balance</p>
                <p className="text-xl font-bold">₹{portfolio.cashBalance?.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-400">Portfolio Value</p>
                <p className="text-xl font-bold">₹{portfolio.totalPortfolioValue?.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-400">Total P&L</p>
                <p className={`text-xl font-bold ${portfolio.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {portfolio.profitLoss >= 0 ? '+' : ''}₹{portfolio.profitLoss?.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-400">Return</p>
                <p className={`text-xl font-bold ${portfolio.profitLossPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {portfolio.profitLossPercent >= 0 ? '+' : ''}{portfolio.profitLossPercent}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['market', 'holdings', 'history'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          <button
            onClick={fetchData}
            className="ml-auto p-2 text-gray-400 hover:text-emerald-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {tab === 'market' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-left text-xs text-gray-500 uppercase">
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Change</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.map((stock) => (
                      <tr
                        key={stock.symbol}
                        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedStock?.symbol === stock.symbol ? 'bg-emerald-50' : ''
                        }`}
                        onClick={() => setSelectedStock(stock)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900 text-sm">{stock.symbol}</div>
                          <div className="text-xs text-gray-500">{stock.name}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-sm">₹{stock.price?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center gap-0.5 text-sm font-medium ${
                            stock.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {stock.change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                            {stock.changePercent}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedStock(stock); }}
                            className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-200"
                          >
                            Trade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'holdings' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {portfolio?.holdings?.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr className="text-left text-xs text-gray-500 uppercase">
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3 text-right">Shares</th>
                        <th className="px-4 py-3 text-right">Avg Price</th>
                        <th className="px-4 py-3 text-right">Current</th>
                        <th className="px-4 py-3 text-right">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.holdings.map((h) => (
                        <tr key={h.symbol} className="border-b border-gray-100">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-sm">{h.symbol}</div>
                            <div className="text-xs text-gray-500">{h.name}</div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm">{h.shares}</td>
                          <td className="px-4 py-3 text-right text-sm">₹{h.avgBuyPrice?.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-sm">₹{h.currentPrice?.toFixed(2)}</td>
                          <td className={`px-4 py-3 text-right text-sm font-semibold ${h.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {h.profitLoss >= 0 ? '+' : ''}₹{h.profitLoss?.toFixed(2)}
                            <div className="text-xs">{h.profitLossPercent}%</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No holdings yet</p>
                    <p className="text-sm">Buy some stocks to start building your portfolio!</p>
                  </div>
                )}
              </div>
            )}

            {tab === 'history' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {portfolio?.transactions?.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr className="text-left text-xs text-gray-500 uppercase">
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-right">Shares</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.transactions.map((t, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="px-4 py-3 font-semibold text-sm">{t.symbol}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              t.type === 'buy' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {t.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm">{t.shares}</td>
                          <td className="px-4 py-3 text-right text-sm">₹{t.price?.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold">₹{t.total?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    <p>No transactions yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trade Panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Trade</h3>
            {selectedStock ? (
              <div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="font-bold text-lg">{selectedStock.symbol}</div>
                  <div className="text-sm text-gray-500">{selectedStock.name}</div>
                  <div className="text-2xl font-bold mt-2">₹{selectedStock.price?.toLocaleString()}</div>
                  <div className={`text-sm ${selectedStock.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent}%
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">Number of Shares</label>
                  <input
                    type="number"
                    min="1"
                    value={shares}
                    onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Total: ₹{(selectedStock.price * shares).toLocaleString()}
                  </p>
                </div>

                {message && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTrade('buy')}
                    disabled={actionLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="h-4 w-4" /> Buy
                  </button>
                  <button
                    onClick={() => handleTrade('sell')}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <TrendingDown className="h-4 w-4" /> Sell
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <BarChart3 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Select a stock to trade</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockSimulator;
