import { NextRequest, NextResponse } from 'next/server';
import { AlphaVantageClient } from '@/lib/alpha-vantage';
import { ApiError } from '@/lib/types/alpha-vantage';

export const revalidate = 300; // Cache for 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase();

    if (!symbol || symbol.length > 10) {
      return NextResponse.json(
        { error: 'Invalid symbol' },
        { status: 400 }
      );
    }

    const client = new AlphaVantageClient();
    
    // Fetch quote data
    const quoteResponse = await client.getGlobalQuote(symbol);
    
    // Fetch company overview for additional metrics
    let overview;
    try {
      overview = await client.getCompanyOverview(symbol);
    } catch (error) {
      console.warn(`Could not fetch overview for ${symbol}`);
    }
    
    const stockData = await client.parseQuoteData(quoteResponse, overview);

    // Add cache headers
    const response = NextResponse.json(stockData);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    
    return response;
  } catch (error) {
    const apiError = error as ApiError;

    if (apiError.code === '429') {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(apiError.retryAfter || 60),
          },
        }
      );
    }

    if (apiError.code === 'RATE_LIMITED') {
      return NextResponse.json(
        { error: 'API rate limit reached. Free tier allows 5 calls/min, 25 calls/day.' },
        { status: 503 }
      );
    }

    console.error('Error fetching stock:', apiError.message);
    return NextResponse.json(
      { error: apiError.message || 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}