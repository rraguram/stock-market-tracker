import { NextResponse } from 'next/server';
import { generateStockData, TOP_STOCKS } from '@/lib/stocks';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const stockInfo = TOP_STOCKS.find((s) => s.symbol === symbol);

    if (!stockInfo) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }

    const stockData = generateStockData(stockInfo.symbol, stockInfo.name);

    return NextResponse.json(stockData);
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
