import { NextResponse } from 'next/server';

const TOP_CRYPTOS = ['BTC-USD', 'ETH-USD', 'BNB-USD', 'SOL-USD', 'XRP-USD'];

export async function GET() {
  try {
    // Fetch real crypto data from Yahoo Finance
    const cryptoPromises = TOP_CRYPTOS.map(symbol => 
      fetchYahooCryptoData(symbol)
    );
    
    const cryptos = await Promise.all(cryptoPromises);
    const validCryptos = cryptos.filter(c => c !== null);

    return NextResponse.json(validCryptos);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crypto data' },
      { status: 500 }
    );
  }
}

async function fetchYahooCryptoData(symbol: string) {
  try {
    const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=2d&interval=1d`;
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

    const ticker = symbol.replace('-USD', '');
    const name = getCryptoName(ticker);

    // Get current and previous close from the actual data points
    const closes = quote.close.filter((c: number | null) => c !== null);
    const currentPrice = closes[closes.length - 1] || meta.regularMarketPrice || 0;
    const previousClose = closes.length > 1 ? closes[closes.length - 2] : meta.chartPreviousClose || currentPrice;
    
    const change = currentPrice - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose * 100) : 0;

    return {
      ticker,
      name,
      symbol,
      price: currentPrice,
      change,
      changePercent,
      volume: quote.volume[quote.volume.length - 1] || 0,
      marketCap: formatMarketCap(meta.marketCap || getMockMarketCap(ticker)),
      high: meta.regularMarketDayHigh || 0,
      low: meta.regularMarketDayLow || 0,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

function getCryptoName(ticker: string): string {
  const names: { [key: string]: string } = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'BNB': 'Binance Coin',
    'SOL': 'Solana',
    'XRP': 'Ripple'
  };
  return names[ticker] || ticker;
}

function getMockMarketCap(ticker: string): number {
  // Approximate market caps as fallback (in billions)
  const marketCaps: { [key: string]: number } = {
    'BTC': 2100000000000,  // ~2.1T
    'ETH': 430000000000,   // ~430B
    'BNB': 145000000000,   // ~145B
    'SOL': 80000000000,    // ~80B
    'XRP': 130000000000    // ~130B
  };
  return marketCaps[ticker] || 0;
}

function formatMarketCap(value?: number): string {
  if (!value) return 'N/A';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return value.toString();
}