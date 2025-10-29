import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { portfolio } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid portfolio ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const portfolioId = parseInt(id);

    // Check if portfolio item exists and belongs to the authenticated user
    const existing = await db
      .select()
      .from(portfolio)
      .where(and(
        eq(portfolio.id, portfolioId),
        eq(portfolio.userId, session.user.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        {
          error: 'Portfolio item not found or you do not have permission to delete it',
          code: 'NOT_FOUND_OR_FORBIDDEN'
        },
        { status: 404 }
      );
    }

    // Delete the portfolio item
    const deleted = await db
      .delete(portfolio)
      .where(and(
        eq(portfolio.id, portfolioId),
        eq(portfolio.userId, session.user.id)
      ))
      .returning();

    return NextResponse.json(
      {
        message: 'Portfolio item deleted successfully',
        deleted: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}