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

    const ticker = symbol.replace('-USD', '');
    const name = getCryptoName(ticker);

    return {
      ticker,
      name,
      symbol,
      price: meta.regularMarketPrice || 0,
      change: meta.regularMarketPrice - meta.previousClose || 0,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
      volume: quote.volume[quote.volume.length - 1] || 0,
      marketCap: formatMarketCap(meta.marketCap),
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

function formatMarketCap(value?: number): string {
  if (!value) return 'N/A';
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toString();
}