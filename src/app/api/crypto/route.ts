import { NextResponse } from 'next/server';
import { MAJOR_CRYPTOS, generateCryptoData } from '@/lib/crypto';

export async function GET() {
  try {
    const cryptos = MAJOR_CRYPTOS.map(({ ticker, name }) =>
      generateCryptoData(ticker, name)
    );

    return NextResponse.json(cryptos);
  } catch (error) {
    console.error('Error generating crypto data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crypto data' },
      { status: 500 }
    );
  }
}
