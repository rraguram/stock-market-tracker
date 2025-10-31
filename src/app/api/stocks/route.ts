import { NextResponse } from 'next/server';

const TOP_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 
  'META', 'TSLA', 'BRK-B', 'V', 'JPM'
];

export async function GET() {
  try {
    // Fetch real data from Yahoo Finance
    const stockPromises = TOP_STOCKS.map(symbol => 
      fetchYahooFinanceData(symbol)
    );
    
    const stocks = await Promise.all(stockPromises);
    const validStocks = stocks.filter(s => s !== null);

    return NextResponse.json(validStocks);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}

async function fetchYahooFinanceData(symbol: string) {
  try {
    // Use Yahoo Finance query API (v8)
    const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1d`;
    const response = await fetch(quoteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${symbol}`);
    }

    const data = await response.json();
    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];

    return {
      symbol: meta.symbol,
      name: meta.longName || meta.symbol,
      price: meta.regularMarketPrice || 0,
      change: meta.regularMarketPrice - meta.previousClose || 0,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
      volume: quote.volume[quote.volume.length - 1] || 0,
      marketCap: formatMarketCap(meta.marketCap),
      high: meta.regularMarketDayHigh || 0,
      low: meta.regularMarketDayLow || 0,
      open: meta.regularMarketOpen || 0,
      previousClose: meta.previousClose || 0,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0,
      peRatio: meta.trailingPE || 0,
      eps: meta.epsTrailingTwelveMonths || 0,
      beta: meta.beta || 1.0,
      dividendYield: meta.dividendYield ? meta.dividendYield * 100 : 0,
      avgVolume: meta.averageDailyVolume10Day || 0,
      sharesOutstanding: formatShares(meta.sharesOutstanding)
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

function formatMarketCap(value?: number): string {
  if (!value) return 'N/A';
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toString();
}

function formatShares(value?: number): string {
  if (!value) return 'N/A';
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toString();
}