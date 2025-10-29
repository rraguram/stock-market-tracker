import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { portfolio } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ 
        error: 'Unauthorized - Please log in',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    // Fetch portfolio items only for the authenticated user
    const portfolioItems = await db.select()
      .from(portfolio)
      .where(eq(portfolio.userId, session.user.id))
      .orderBy(desc(portfolio.createdAt));

    return NextResponse.json(portfolioItems, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ 
        error: 'Unauthorized - Please log in',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { symbol, name, quantity, purchasePrice } = body;

    // Validate required fields
    if (!symbol || !name || quantity === undefined || quantity === null || purchasePrice === undefined || purchasePrice === null) {
      return NextResponse.json({ 
        error: "Symbol, name, quantity, and purchase price are required",
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    // Sanitize and validate symbol
    const sanitizedSymbol = typeof symbol === 'string' ? symbol.trim().toUpperCase() : '';
    if (!sanitizedSymbol) {
      return NextResponse.json({ 
        error: "Symbol must be a non-empty string",
        code: "INVALID_SYMBOL" 
      }, { status: 400 });
    }

    // Sanitize and validate name
    const sanitizedName = typeof name === 'string' ? name.trim() : '';
    if (!sanitizedName) {
      return NextResponse.json({ 
        error: "Name must be a non-empty string",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    // Validate and convert quantity
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json({ 
        error: "Quantity must be a positive number",
        code: "INVALID_QUANTITY" 
      }, { status: 400 });
    }

    // Validate and convert purchasePrice
    const priceNum = parseInt(purchasePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json({ 
        error: "Purchase price must be a positive number",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    // Insert new portfolio item with authenticated user's ID
    const newPortfolioItem = await db.insert(portfolio)
      .values({
        symbol: sanitizedSymbol,
        name: sanitizedName,
        quantity: quantityNum,
        purchasePrice: priceNum,
        userId: session.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newPortfolioItem[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}