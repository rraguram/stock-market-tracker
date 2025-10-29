// Stock data utilities and API integration

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  // Additional metrics
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  peRatio: number;
  eps: number;
  beta: number;
  dividendYield: number;
  avgVolume: number;
  sharesOutstanding: string;
}

export interface StockHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  category?: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

// Top 10 S&P 500 stocks by market cap
export const TOP_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
];

// Generate realistic stock data
export function generateStockData(symbol: string, name: string): Stock {
  const basePrice = Math.random() * 400 + 50;
  const change = (Math.random() - 0.5) * 20;
  const changePercent = (change / basePrice) * 100;

  return {
    symbol,
    name,
    price: parseFloat(basePrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    volume: Math.floor(Math.random() * 50000000) + 10000000,
    marketCap: `${(Math.random() * 2000 + 500).toFixed(0)}B`,
    high: parseFloat((basePrice + Math.random() * 10).toFixed(2)),
    low: parseFloat((basePrice - Math.random() * 10).toFixed(2)),
    open: parseFloat((basePrice + (Math.random() - 0.5) * 5).toFixed(2)),
    previousClose: parseFloat((basePrice - change).toFixed(2)),
    // Additional metrics
    fiftyTwoWeekHigh: parseFloat((basePrice * (1.2 + Math.random() * 0.3)).toFixed(2)),
    fiftyTwoWeekLow: parseFloat((basePrice * (0.6 + Math.random() * 0.2)).toFixed(2)),
    peRatio: parseFloat((15 + Math.random() * 30).toFixed(2)),
    eps: parseFloat((basePrice / (15 + Math.random() * 30)).toFixed(2)),
    beta: parseFloat((0.8 + Math.random() * 0.8).toFixed(2)),
    dividendYield: parseFloat((Math.random() * 3).toFixed(2)),
    avgVolume: Math.floor(Math.random() * 40000000) + 15000000,
    sharesOutstanding: `${(Math.random() * 15 + 5).toFixed(2)}B`,
  };
}

// Generate historical data
export function generateHistoricalData(
  days: number,
  basePrice: number = 150
): StockHistory[] {
  const data: StockHistory[] = [];
  let currentPrice = basePrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const open = currentPrice;
    const change = (Math.random() - 0.5) * 10;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 10000000,
    });

    currentPrice = close;
  }

  return data;
}

// Generate market indices
export function generateMarketIndices(): MarketIndex[] {
  return [
    {
      symbol: '^GSPC',
      name: 'S&P 500',
      value: 4783.45,
      change: 23.12,
      changePercent: 0.49,
    },
    {
      symbol: '^DJI',
      name: 'Dow Jones',
      value: 37440.34,
      change: -45.23,
      changePercent: -0.12,
    },
    {
      symbol: '^IXIC',
      name: 'Nasdaq',
      value: 15043.98,
      change: 87.45,
      changePercent: 0.58,
    },
  ];
}

// Generate news items
export function generateNewsItems(symbol?: string): NewsItem[] {
  const generalNews = [
    {
      id: '1',
      title: 'Fed Signals Potential Rate Cuts in 2024',
      description: 'Federal Reserve officials hint at possible interest rate reductions as inflation shows signs of cooling.',
      url: '#',
      source: 'Financial Times',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
      category: 'economy',
    },
    {
      id: '2',
      title: 'Tech Stocks Rally on Strong Earnings Reports',
      description: 'Major technology companies beat earnings expectations, driving market gains across the sector.',
      url: '#',
      source: 'Bloomberg',
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
      category: 'earnings',
    },
    {
      id: '3',
      title: 'Market Volatility Expected Amid Global Economic Shifts',
      description: 'Analysts predict increased market fluctuations as global economic conditions continue to evolve.',
      url: '#',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop',
      category: 'market-trends',
    },
    {
      id: '4',
      title: 'Oil Prices Surge on Supply Concerns',
      description: 'Energy markets react to geopolitical tensions affecting global oil supply chains.',
      url: '#',
      source: 'Wall Street Journal',
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
      category: 'market-trends',
    },
  ];

  if (symbol) {
    return [
      {
        id: `${symbol}-1`,
        title: `${symbol} Announces New Product Launch`,
        description: `Company reveals innovative product line expected to drive growth in upcoming quarters.`,
        url: '#',
        source: 'CNBC',
        publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
      },
      {
        id: `${symbol}-2`,
        title: `Analysts Upgrade ${symbol} Stock Rating`,
        description: `Multiple analysts raise price targets citing strong fundamentals and market position.`,
        url: '#',
        source: 'MarketWatch',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
      },
      ...generalNews.slice(0, 2),
    ];
  }

  return generalNews;
}