import { NextResponse } from 'next/server';

// Expanded stock universe for screening
const STOCK_UNIVERSE = [
  // Technology
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO', 'ORCL', 'ADBE',
  'CRM', 'NFLX', 'INTC', 'AMD', 'QCOM', 'TXN', 'AMAT', 'MU', 'LRCX', 'KLAC',
  // Finance
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'SCHW', 'AXP', 'USB',
  // Healthcare
  'UNH', 'JNJ', 'LLY', 'ABBV', 'MRK', 'PFE', 'TMO', 'ABT', 'DHR', 'BMY',
  // Consumer
  'WMT', 'HD', 'PG', 'KO', 'PEP', 'COST', 'NKE', 'MCD', 'SBUX', 'TGT',
  // Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PXD', 'MPC', 'PSX', 'VLO', 'OXY',
  // Industrials
  'BA', 'CAT', 'HON', 'UPS', 'RTX', 'LMT', 'GE', 'MMM', 'DE', 'EMR',
  // Communication
  'DIS', 'CMCSA', 'VZ', 'T', 'TMUS', 'CHTR', 'NFLX', 'EA', 'TTWO', 'PARA'
];

interface ScreenerFilters {
  minPrice?: number;
  maxPrice?: number;
  minVolume?: number;
  maxVolume?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minPE?: number;
  maxPE?: number;
  minEPS?: number;
  maxEPS?: number;
  minDividendYield?: number;
  maxDividendYield?: number;
  minBeta?: number;
  maxBeta?: number;
  sector?: string;
  priceChange?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: ScreenerFilters = {
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      minVolume: searchParams.get('minVolume') ? parseFloat(searchParams.get('minVolume')!) : undefined,
      maxVolume: searchParams.get('maxVolume') ? parseFloat(searchParams.get('maxVolume')!) : undefined,
      minMarketCap: searchParams.get('minMarketCap') ? parseFloat(searchParams.get('minMarketCap')!) : undefined,
      maxMarketCap: searchParams.get('maxMarketCap') ? parseFloat(searchParams.get('maxMarketCap')!) : undefined,
      minPE: searchParams.get('minPE') ? parseFloat(searchParams.get('minPE')!) : undefined,
      maxPE: searchParams.get('maxPE') ? parseFloat(searchParams.get('maxPE')!) : undefined,
      minEPS: searchParams.get('minEPS') ? parseFloat(searchParams.get('minEPS')!) : undefined,
      maxEPS: searchParams.get('maxEPS') ? parseFloat(searchParams.get('maxEPS')!) : undefined,
      minDividendYield: searchParams.get('minDividendYield') ? parseFloat(searchParams.get('minDividendYield')!) : undefined,
      maxDividendYield: searchParams.get('maxDividendYield') ? parseFloat(searchParams.get('maxDividendYield')!) : undefined,
      minBeta: searchParams.get('minBeta') ? parseFloat(searchParams.get('minBeta')!) : undefined,
      maxBeta: searchParams.get('maxBeta') ? parseFloat(searchParams.get('maxBeta')!) : undefined,
      sector: searchParams.get('sector') || undefined,
      priceChange: searchParams.get('priceChange') || undefined,
    };

    // Fetch stock data in parallel (batches of 10 to avoid rate limits)
    const batchSize = 10;
    const allStocks = [];
    
    for (let i = 0; i < STOCK_UNIVERSE.length; i += batchSize) {
      const batch = STOCK_UNIVERSE.slice(i, i + batchSize);
      const batchPromises = batch.map(symbol => fetchStockData(symbol));
      const batchResults = await Promise.all(batchPromises);
      allStocks.push(...batchResults.filter(s => s !== null));
      
      // Small delay between batches
      if (i + batchSize < STOCK_UNIVERSE.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Apply filters
    const filteredStocks = allStocks.filter(stock => {
      if (filters.minPrice && stock.price < filters.minPrice) return false;
      if (filters.maxPrice && stock.price > filters.maxPrice) return false;
      
      if (filters.minVolume && stock.volume < filters.minVolume) return false;
      if (filters.maxVolume && stock.volume > filters.maxVolume) return false;
      
      if (filters.minMarketCap && parseMarketCap(stock.marketCap) < filters.minMarketCap) return false;
      if (filters.maxMarketCap && parseMarketCap(stock.marketCap) > filters.maxMarketCap) return false;
      
      if (filters.minPE && stock.peRatio < filters.minPE) return false;
      if (filters.maxPE && stock.peRatio > filters.maxPE) return false;
      
      if (filters.minEPS && stock.eps < filters.minEPS) return false;
      if (filters.maxEPS && stock.eps > filters.maxEPS) return false;
      
      if (filters.minDividendYield && stock.dividendYield < filters.minDividendYield) return false;
      if (filters.maxDividendYield && stock.dividendYield > filters.maxDividendYield) return false;
      
      if (filters.minBeta && stock.beta < filters.minBeta) return false;
      if (filters.maxBeta && stock.beta > filters.maxBeta) return false;
      
      if (filters.sector && filters.sector !== 'all' && stock.sector.toLowerCase() !== filters.sector.toLowerCase()) return false;
      
      if (filters.priceChange === 'gainers' && stock.changePercent <= 0) return false;
      if (filters.priceChange === 'losers' && stock.changePercent >= 0) return false;
      
      return true;
    });

    return NextResponse.json({
      count: filteredStocks.length,
      results: filteredStocks
    });
  } catch (error) {
    console.error('Error in screener:', error);
    return NextResponse.json(
      { error: 'Failed to fetch screener data' },
      { status: 500 }
    );
  }
}

async function fetchStockData(symbol: string) {
  try {
    const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=2d&interval=1d`;
    const response = await fetch(quoteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];

    // Get current and previous close from the actual data points
    const closes = quote.close.filter((c: number | null) => c !== null);
    const currentPrice = closes[closes.length - 1] || meta.regularMarketPrice || 0;
    const previousClose = closes.length > 1 ? closes[closes.length - 2] : meta.chartPreviousClose || meta.previousClose || currentPrice;
    
    const change = currentPrice - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose * 100) : 0;

    return {
      symbol: meta.symbol,
      name: meta.longName || meta.symbol,
      price: currentPrice,
      change,
      changePercent,
      volume: quote.volume[quote.volume.length - 1] || 0,
      marketCap: formatMarketCap(meta.marketCap),
      peRatio: meta.trailingPE || 0,
      eps: meta.epsTrailingTwelveMonths || 0,
      beta: meta.beta || 1.0,
      dividendYield: meta.dividendYield ? meta.dividendYield * 100 : 0,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0,
      sector: determineSector(meta.symbol)
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

function parseMarketCap(marketCapStr: string): number {
  if (marketCapStr === 'N/A') return 0;
  const value = parseFloat(marketCapStr);
  if (marketCapStr.includes('T')) return value * 1e12;
  if (marketCapStr.includes('B')) return value * 1e9;
  if (marketCapStr.includes('M')) return value * 1e6;
  return value;
}

function determineSector(symbol: string): string {
  const sectors: { [key: string]: string[] } = {
    'Technology': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO', 'ORCL', 'ADBE', 'CRM', 'NFLX', 'INTC', 'AMD', 'QCOM', 'TXN', 'AMAT', 'MU', 'LRCX', 'KLAC'],
    'Finance': ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'SCHW', 'AXP', 'USB'],
    'Healthcare': ['UNH', 'JNJ', 'LLY', 'ABBV', 'MRK', 'PFE', 'TMO', 'ABT', 'DHR', 'BMY'],
    'Consumer': ['WMT', 'HD', 'PG', 'KO', 'PEP', 'COST', 'NKE', 'MCD', 'SBUX', 'TGT'],
    'Energy': ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PXD', 'MPC', 'PSX', 'VLO', 'OXY'],
    'Industrials': ['BA', 'CAT', 'HON', 'UPS', 'RTX', 'LMT', 'GE', 'MMM', 'DE', 'EMR'],
    'Communication': ['DIS', 'CMCSA', 'VZ', 'T', 'TMUS', 'CHTR', 'EA', 'TTWO', 'PARA']
  };

  for (const [sector, symbols] of Object.entries(sectors)) {
    if (symbols.includes(symbol)) return sector;
  }
  
  return 'Other';
}