import { NextResponse } from 'next/server';
import { generateStockData, TOP_STOCKS } from '@/lib/stocks';

export async function GET() {
  try {
    // Generate data for top 10 stocks
    const stocks = TOP_STOCKS.map(({ symbol, name }) =>
      generateStockData(symbol, name)
    );

    return NextResponse.json(stocks);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
