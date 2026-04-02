const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

export const hasAlphaVantageKey = () =>
  Boolean(process.env.ALPHA_VANTAGE_API_KEY);

export const fetchDailySeries = async (symbol) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error("ALPHA_VANTAGE_API_KEY is not set");
  }

  const url = new URL(ALPHA_VANTAGE_BASE_URL);
  url.searchParams.set("function", "TIME_SERIES_DAILY");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("outputsize", "compact");
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Alpha Vantage request failed with status ${response.status}`);
  }

  if (data["Error Message"]) {
    throw new Error(data["Error Message"]);
  }

  if (data.Note) {
    throw new Error(data.Note);
  }

  const series = data["Time Series (Daily)"];
  if (!series) {
    throw new Error(`No daily series returned for ${symbol}`);
  }

  const dates = Object.keys(series).sort((a, b) => b.localeCompare(a));
  const latest = series[dates[0]];
  const previous = series[dates[1]] || latest;

  return {
    latestDate: dates[0],
    latest,
    previous,
    meta: data["Meta Data"] || {},
  };
};
