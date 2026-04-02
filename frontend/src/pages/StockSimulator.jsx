import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock3,
  Filter,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import API_BASE_URL from '../config';

const formatRefreshTime = (value) => {
  if (!value) return 'Not refreshed yet';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown refresh time';

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const StockSimulator = () => {
  const [marketData, setMarketData] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [shares, setShares] = useState(1);
  const [tab, setTab] = useState('market');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshingMarket, setRefreshingMarket] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedSector, setSelectedSector] = useState('All');
  const { refreshUser } = useContext(UserContext);

  const fetchMarketData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/games/stocks/market`, {
        credentials: 'include',
      });
      const data = await res.json();
      setMarketData(Array.isArray(data) ? data : []);

      if (selectedStock) {
        const updatedSelection = data.find((stock) => stock.symbol === selectedStock.symbol);
        if (updatedSelection) {
          setSelectedStock(updatedSelection);
        }
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
    }
  }, [selectedStock]);

  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/games/stocks/portfolio`, {
        credentials: 'include',
      });
      const data = await res.json();
      setPortfolio(data);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    await Promise.all([fetchMarketData(), fetchPortfolio()]);
    setLoading(false);
  }, [fetchMarketData, fetchPortfolio]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, [fetchData, fetchMarketData]);

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
        await Promise.all([fetchPortfolio(), fetchMarketData()]);
        refreshUser();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (_err) {
      setMessage({ type: 'error', text: 'Trade failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarketRefresh = async () => {
    setRefreshingMarket(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/games/stocks/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to refresh market');
      }

      await fetchMarketData();
      setMessage({
        type: 'success',
        text: `Market refreshed using ${data.provider || 'market data'} data.`,
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to refresh market data',
      });
    } finally {
      setRefreshingMarket(false);
    }
  };

  const provider = marketData[0]?.marketDataProvider || 'seeded-simulation';
  const lastRefreshedAt = marketData[0]?.marketLastRefreshedAt;

  const sectors = useMemo(() => {
    const uniqueSectors = Array.from(
      new Set(marketData.map((stock) => stock.sector).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    return ['All', ...uniqueSectors];
  }, [marketData]);

  const filteredMarketData = useMemo(() => (
    selectedSector === 'All'
      ? marketData
      : marketData.filter((stock) => stock.sector === selectedSector)
  ), [marketData, selectedSector]);

  const topGainers = useMemo(() => (
    [...marketData]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 3)
  ), [marketData]);

  const topLosers = useMemo(() => (
    [...marketData]
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 3)
  ), [marketData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-blue-900 rounded-3xl p-8 mb-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-6 w-6 text-cyan-400" />
                <h1 className="text-2xl font-bold">Stock Market Simulator</h1>
              </div>
              <p className="text-gray-300 max-w-2xl">
                Practice investing with virtual ₹1,00,000 using a richer Indian market powered by daily snapshots and live gameplay simulation.
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 min-w-[260px]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Market Feed</p>
                <span className="text-[11px] px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                  {provider}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <Clock3 className="h-4 w-4 text-cyan-300" />
                <span>Last refresh: {formatRefreshTime(lastRefreshedAt)}</span>
              </div>
              <button
                onClick={handleMarketRefresh}
                disabled={refreshingMarket}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-semibold px-4 py-2.5 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${refreshingMarket ? 'animate-spin' : ''}`} />
                {refreshingMarket ? 'Refreshing...' : 'Force Daily Refresh'}
              </button>
            </div>
          </div>

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
                <p className={`text-xl font-bold ${portfolio.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {portfolio.profitLoss >= 0 ? '+' : ''}₹{portfolio.profitLoss?.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-400">Return</p>
                <p className={`text-xl font-bold ${portfolio.profitLossPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {portfolio.profitLossPercent >= 0 ? '+' : ''}{portfolio.profitLossPercent}%
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid xl:grid-cols-[1.8fr_1fr] gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h2 className="font-semibold text-gray-900">Top Gainers</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {topGainers.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => setSelectedStock(stock)}
                  className="text-left rounded-xl border border-emerald-100 bg-emerald-50 p-4 hover:border-emerald-300 transition-colors"
                >
                  <p className="font-semibold text-gray-900">{stock.symbol}</p>
                  <p className="text-xs text-gray-500 mb-2">{stock.sector}</p>
                  <p className="text-lg font-bold text-gray-900">₹{stock.price?.toLocaleString()}</p>
                  <p className="text-sm font-semibold text-emerald-600">+{stock.changePercent}%</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-rose-500" />
              <h2 className="font-semibold text-gray-900">Top Losers</h2>
            </div>
            <div className="space-y-3">
              {topLosers.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => setSelectedStock(stock)}
                  className="w-full text-left rounded-xl border border-rose-100 bg-rose-50 p-4 hover:border-rose-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{stock.symbol}</p>
                      <p className="text-xs text-gray-500">{stock.sector}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{stock.price?.toLocaleString()}</p>
                      <p className="text-sm font-semibold text-rose-600">{stock.changePercent}%</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {['market', 'holdings', 'history'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {tab === 'market' && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 border-b border-gray-200 bg-gray-50">
                  <div>
                    <h3 className="font-semibold text-gray-900">Market Explorer</h3>
                    <p className="text-sm text-gray-500">
                      Browse a richer Indian stock universe with sector filters and refreshed daily anchors.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {sectors.map((sector) => (
                        <option key={sector} value={sector}>
                          {sector}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white border-b border-gray-200">
                      <tr className="text-left text-xs text-gray-500 uppercase">
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Sector</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Change</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMarketData.map((stock) => (
                        <tr
                          key={stock.symbol}
                          className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedStock?.symbol === stock.symbol ? 'bg-emerald-50' : ''
                          }`}
                          onClick={() => setSelectedStock(stock)}
                        >
                          <td className="px-4 py-4">
                            <div className="font-semibold text-gray-900 text-sm">{stock.symbol}</div>
                            <div className="text-xs text-gray-500">{stock.name}</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {stock.exchange}
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                {stock.marketCapBand?.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">{stock.sector}</td>
                          <td className="px-4 py-4 text-right font-semibold text-sm">
                            ₹{stock.price?.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className={`inline-flex items-center gap-0.5 text-sm font-medium ${
                              stock.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {stock.change >= 0 ? (
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowDownRight className="h-3.5 w-3.5" />
                              )}
                              {stock.changePercent}%
                            </span>
                            <div className="text-xs text-gray-400 mt-1">
                              {stock.change >= 0 ? '+' : ''}₹{stock.change}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStock(stock);
                              }}
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
                        <th className="px-4 py-3 text-right">P&amp;L</th>
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
                          <td className={`px-4 py-3 text-right text-sm font-semibold ${h.profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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
                    <p className="text-sm">Buy some stocks to start building your portfolio.</p>
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
                              t.type === 'buy' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
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

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-4">Trade</h3>
              {selectedStock ? (
                <div>
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-bold text-lg">{selectedStock.symbol}</div>
                        <div className="text-sm text-gray-500">{selectedStock.name}</div>
                      </div>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                        {selectedStock.sector}
                      </span>
                    </div>
                    <div className="text-2xl font-bold mt-3">₹{selectedStock.price?.toLocaleString()}</div>
                    <div className={`text-sm font-medium mt-1 ${selectedStock.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent}%
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      {selectedStock.description || 'No company summary available.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                      <p className="text-gray-500 text-xs">Previous Close</p>
                      <p className="font-semibold text-gray-900">₹{selectedStock.previousClose?.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                      <p className="text-gray-500 text-xs">Volume</p>
                      <p className="font-semibold text-gray-900">{selectedStock.volume?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-1">Number of Shares</label>
                    <input
                      type="number"
                      min="1"
                      value={shares}
                      onChange={(e) => setShares(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Total: ₹{(selectedStock.price * shares).toLocaleString()}
                    </p>
                  </div>

                  {message && (
                    <div className={`text-sm p-3 rounded-lg mb-4 ${
                      message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
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
                      className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
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
    </div>
  );
};

export default StockSimulator;
