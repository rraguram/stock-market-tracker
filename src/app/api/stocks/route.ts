import { NextResponse } from 'next/server';
import { AlphaVantageClient } from '@/lib/alpha-vantage';
import { ApiError } from '@/lib/types/alpha-vantage';

const TOP_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 
  'META', 'TSLA', 'BRK.B', 'V', 'JPM'
];

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const client = new AlphaVantageClient();
    const stocks = [];
    
    // Fetch stocks with delay to respect rate limits (5 calls/min)
    for (const symbol of TOP_STOCKS) {
      try {
        const quoteResponse = await client.getGlobalQuote(symbol);
        
        // Try to get company overview (optional)
        let overview;
        try {
          overview = await client.getCompanyOverview(symbol);
        } catch (error) {
          console.warn(`Could not fetch overview for ${symbol}`);
        }
        
        const stockData = await client.parseQuoteData(quoteResponse, overview);
        stocks.push(stockData);
        
        // Add delay between requests (12 seconds = 5 calls/min)
        if (stocks.length < TOP_STOCKS.length) {
          await new Promise(resolve => setTimeout(resolve, 12000));
        }
      } catch (error) {
        const apiError = error as ApiError;
        console.error(`Error fetching ${symbol}:`, apiError.message);
        // Continue with next stock even if one fails
      }
    }

    if (stocks.length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch any stock data' },
        { status: 500 }
      );
    }

    return NextResponse.json(stocks);
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error fetching stocks:', apiError.message);
    
    return NextResponse.json(
      { error: apiError.message || 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}