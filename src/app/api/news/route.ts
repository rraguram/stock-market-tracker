import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    let newsItems;
    
    if (symbol) {
      // Fetch stock-specific news from Yahoo Finance
      newsItems = await fetchYahooStockNews(symbol);
    } else {
      // Fetch general market news
      newsItems = await fetchYahooMarketNews();
    }

    return NextResponse.json(newsItems);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

async function fetchYahooStockNews(symbol: string) {
  try {
    // Use Yahoo Finance news API
    const newsUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=20`;
    const response = await fetch(newsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    const data = await response.json();
    const news = data.news || [];

    return news.map((item: any, index: number) => ({
      id: item.uuid || `news-${index}`,
      title: item.title,
      description: item.description || item.summary || '',
      url: `https://finance.yahoo.com${item.link || ''}`,
      source: item.publisher || 'Yahoo Finance',
      publishedAt: new Date(item.providerPublishTime * 1000).toISOString(),
      imageUrl: item.thumbnail?.resolutions?.[0]?.url || item.thumbnail?.url,
      category: item.type || 'market',
      image: item.thumbnail?.resolutions?.[0]?.url || item.thumbnail?.url
    }));
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
}

async function fetchYahooMarketNews() {
  try {
    // Fetch general market news from multiple sources
    const sources = ['S&P 500', 'stock market', 'Wall Street'];
    const allNews = await Promise.all(
      sources.map(source => fetchNewsFromSource(source))
    );

    // Flatten and deduplicate
    const newsMap = new Map();
    allNews.flat().forEach(item => {
      if (!newsMap.has(item.id)) {
        newsMap.set(item.id, item);
      }
    });

    const news = Array.from(newsMap.values());
    
    // Sort by date
    news.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return news.slice(0, 20);
  } catch (error) {
    console.error('Error fetching market news:', error);
    return [];
  }
}

async function fetchNewsFromSource(query: string) {
  try {
    const newsUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=10`;
    const response = await fetch(newsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const news = data.news || [];

    return news.map((item: any, index: number) => ({
      id: item.uuid || `${query}-${index}`,
      title: item.title,
      description: item.description || item.summary || '',
      url: `https://finance.yahoo.com${item.link || ''}`,
      source: item.publisher || 'Yahoo Finance',
      publishedAt: new Date(item.providerPublishTime * 1000).toISOString(),
      imageUrl: item.thumbnail?.resolutions?.[0]?.url || item.thumbnail?.url,
      category: item.type || 'market',
      image: item.thumbnail?.resolutions?.[0]?.url || item.thumbnail?.url
    }));
  } catch (error) {
    return [];
  }
}