import { NextResponse } from 'next/server';
import { generateNewsItems } from '@/lib/stocks';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || undefined;
    const category = searchParams.get('category');

    let news = generateNewsItems(symbol);

    if (category && category !== 'all') {
      news = news.filter((item) => item.category === category);
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
