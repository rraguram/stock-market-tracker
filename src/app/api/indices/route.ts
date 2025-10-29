import { NextResponse } from 'next/server';
import { generateMarketIndices } from '@/lib/stocks';

export async function GET() {
  try {
    const indices = generateMarketIndices();
    return NextResponse.json(indices);
  } catch (error) {
    console.error('Error fetching indices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market indices' },
      { status: 500 }
    );
  }
}
