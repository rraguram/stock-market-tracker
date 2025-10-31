import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || undefined;

    // Generate FinViz-style news data
    const newsItems = generateFinVizStyleNews(symbol);

    return NextResponse.json(newsItems);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

function generateFinVizStyleNews(symbol?: string) {
  const sources = [
    'Reuters', 'Bloomberg', 'MarketWatch', 'CNBC', 'Seeking Alpha',
    'Barron\'s', 'WSJ', 'Financial Times', 'Yahoo Finance', 'Investor\'s Business Daily'
  ];
  
  const headlines = [
    'Fed signals potential rate cut in December as inflation cools',
    'Tech stocks rally as AI spending drives Q4 earnings beats',
    'Oil prices surge 3% on OPEC+ production cut extension',
    'S&P 500 reaches new all-time high on strong jobs data',
    'Treasury yields fall as investors seek safe haven assets',
    'Dollar strengthens against major currencies on Fed comments',
    'Nasdaq jumps 2% led by semiconductor stock gains',
    'Gold hits record high amid geopolitical tensions',
    'Banks report strong Q4 earnings, raise dividend guidance',
    'Retail sales exceed expectations, boosting consumer stocks',
    'Housing starts decline as mortgage rates remain elevated',
    'Manufacturing PMI shows expansion for third straight month',
    'Bitcoin surges past $65K on ETF approval optimism',
    'Energy sector leads market gains on crude price rally',
    'Small-cap stocks outperform as investors rotate portfolios',
    'European markets close higher on ECB policy outlook',
    'Asian markets mixed amid China growth concerns',
    'Corporate bond spreads tighten on improved credit conditions',
    'Inflation data comes in below forecasts, lifting equities',
    'Merger activity picks up as dealmaking sentiment improves'
  ];

  const now = new Date();
  const news: any[] = [];

  for (let i = 0; i < 20; i++) {
    const minutesAgo = Math.floor(Math.random() * 480); // Random time within last 8 hours
    const timestamp = new Date(now.getTime() - minutesAgo * 60000);
    const source = sources[Math.floor(Math.random() * sources.length)];
    const headline = headlines[Math.floor(Math.random() * headlines.length)];
    
    news.push({
      id: `finviz-${i}`,
      title: headline,
      url: `https://finviz.com/news/${1000 + i}`,
      source: source,
      publishedAt: timestamp.toISOString(),
      category: 'market'
    });
  }

  // Sort by most recent first
  news.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return news;
}