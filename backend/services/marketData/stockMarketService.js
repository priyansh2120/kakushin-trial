import MarketStock from "../../models/marketStock.model.js";
import { DEFAULT_MARKET_CATALOG } from "./stockCatalog.js";
import { fetchDailySeries, hasAlphaVantageKey } from "./alphaVantageClient.js";

const STARTING_REFRESH_HOUR_IST = 18;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const toTwoDecimals = (value) => Math.round(Number(value) * 100) / 100;

const getIstDateKey = (date = new Date()) => {
  const istDate = new Date(date.getTime() + IST_OFFSET_MS);
  return istDate.toISOString().slice(0, 10);
};

const getIntradayDrift = (symbol, volatility) => {
  const now = Date.now();
  const minuteBucket = Math.floor(now / (1000 * 60 * 15));
  const seed =
    symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) *
    0.01;
  return Math.sin(minuteBucket + seed) * volatility * 0.35;
};

const buildSimulatedSnapshot = (stock) => {
  const anchor = stock.price || stock.basePrice || stock.previousClose;
  const previousClose = stock.previousClose || stock.basePrice || anchor;
  const volatility = stock.baseVolatility || 0.02;
  const intradayDrift = getIntradayDrift(stock.symbol, volatility);
  const price = toTwoDecimals(anchor * (1 + intradayDrift));
  const change = toTwoDecimals(price - previousClose);
  const changePercent =
    previousClose > 0 ? toTwoDecimals((change / previousClose) * 100) : 0;

  return {
    price,
    previousClose,
    open: stock.open || previousClose,
    high: Math.max(stock.high || price, price),
    low: Math.min(stock.low || price, price),
    volume: stock.volume || Math.round(100000 + Math.abs(changePercent) * 50000),
    change,
    changePercent,
    source: stock.source || "seeded-simulation",
    refreshStatus: stock.refreshStatus || "seeded",
    lastRefreshedAt: stock.lastRefreshedAt || new Date(),
  };
};

const mapAlphaSeriesToSnapshot = (catalogItem, series) => {
  const latest = series.latest;
  const previous = series.previous;
  const close = Number(latest["4. close"]);
  const previousClose = Number(previous["4. close"]);
  const change = close - previousClose;

  return {
    symbol: catalogItem.symbol,
    alphaSymbol: catalogItem.alphaSymbol,
    name: catalogItem.name,
    exchange: "BSE",
    sector: catalogItem.sector,
    marketCapBand: catalogItem.marketCapBand,
    baseVolatility: catalogItem.baseVolatility,
    description: catalogItem.description,
    price: toTwoDecimals(close),
    previousClose: toTwoDecimals(previousClose),
    open: toTwoDecimals(Number(latest["1. open"])),
    high: toTwoDecimals(Number(latest["2. high"])),
    low: toTwoDecimals(Number(latest["3. low"])),
    volume: Number(latest["5. volume"]) || 0,
    change: toTwoDecimals(change),
    changePercent:
      previousClose > 0 ? toTwoDecimals((change / previousClose) * 100) : 0,
    source: "alpha-vantage",
    refreshStatus: "live-eod",
    lastRefreshedAt: new Date(),
  };
};

export const seedMarketStocks = async () => {
  const existingCount = await MarketStock.countDocuments();
  if (existingCount > 0) {
    return;
  }

  await MarketStock.insertMany(
    DEFAULT_MARKET_CATALOG.map((stock) => {
      const seeded = buildSimulatedSnapshot(stock);
      return {
        symbol: stock.symbol,
        alphaSymbol: stock.alphaSymbol,
        name: stock.name,
        exchange: "BSE",
        sector: stock.sector,
        marketCapBand: stock.marketCapBand,
        baseVolatility: stock.baseVolatility,
        description: stock.description,
        ...seeded,
      };
    })
  );
};

const isRefreshDue = (stocks) => {
  if (!stocks.length) {
    return true;
  }

  const now = new Date();
  const istNow = new Date(now.getTime() + IST_OFFSET_MS);
  const currentIstHour = istNow.getUTCHours();
  if (currentIstHour < STARTING_REFRESH_HOUR_IST) {
    return false;
  }

  const todayKey = getIstDateKey(now);
  return stocks.some((stock) => getIstDateKey(stock.lastRefreshedAt) !== todayKey);
};

export const refreshMarketStocksIfNeeded = async (options = {}) => {
  const { force = false } = options;
  await seedMarketStocks();

  const existing = await MarketStock.find().sort({ symbol: 1 }).lean();
  if (!hasAlphaVantageKey() || (!force && !isRefreshDue(existing))) {
    return;
  }

  for (const catalogItem of DEFAULT_MARKET_CATALOG) {
    try {
      const series = await fetchDailySeries(catalogItem.alphaSymbol);
      const snapshot = mapAlphaSeriesToSnapshot(catalogItem, series);
      await MarketStock.findOneAndUpdate(
        { symbol: catalogItem.symbol },
        snapshot,
        { upsert: true, new: true }
      );
    } catch (error) {
      await MarketStock.findOneAndUpdate(
        { symbol: catalogItem.symbol },
        {
          refreshStatus: "stale-fallback",
          source: "seeded-simulation",
        }
      );
    }
  }
};

export const getMarketStocks = async () => {
  await refreshMarketStocksIfNeeded();
  const stocks = await MarketStock.find().sort({ symbol: 1 }).lean();

  return stocks.map((stock) => ({
    symbol: stock.symbol,
    name: stock.name,
    exchange: stock.exchange,
    sector: stock.sector,
    marketCapBand: stock.marketCapBand,
    description: stock.description,
    ...buildSimulatedSnapshot(stock),
  }));
};

export const getMarketStockBySymbol = async (symbol) => {
  const stocks = await getMarketStocks();
  return stocks.find((stock) => stock.symbol === symbol);
};

export const getMarketDataStatus = async () => {
  await seedMarketStocks();
  const stocks = await MarketStock.find().sort({ lastRefreshedAt: -1 }).lean();
  const latest = stocks[0];

  return {
    provider: latest?.source || (hasAlphaVantageKey() ? "alpha-vantage" : "seeded-simulation"),
    hasLiveKey: hasAlphaVantageKey(),
    stockCount: stocks.length,
    lastRefreshedAt: latest?.lastRefreshedAt || null,
  };
};
