export const runtime = 'nodejs';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/server/auth';
import { prisma } from '@/lib/db';
import { getWalletBalanceWithLock } from '@/lib/utils/walletTransactions';
import { parsePaginationParams, buildPaginationHeaders } from '@/lib/utils/pagination';

export async function GET(req: NextRequest) {
  try {
    const { id: userId } = getAuthedUser(req);
    const { searchParams } = new URL(req.url);
    const paginationParams = parsePaginationParams(searchParams, {
      maxLimit: 50,
      defaultLimit: 10,
    });

    // Ensure wallet exists
    const wallet = await prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { 
        userId, 
        tenantId: 'default', // Use default tenant
        funds: 1000, 
        diamonds: 10 
      },
    });

    // Get paginated ledger entries
    const cursorWhere = paginationParams.cursor ? {
      OR: [
        {
          createdAt: {
            lt: new Date(parseInt(Buffer.from(paginationParams.cursor, 'base64').toString('utf-8').split('-')[0])),
          },
        },
        {
          createdAt: new Date(parseInt(Buffer.from(paginationParams.cursor, 'base64').toString('utf-8').split('-')[0])),
          id: {
            lt: Buffer.from(paginationParams.cursor, 'base64').toString('utf-8').split('-')[1],
          },
        },
      ],
    } : {};

    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: { 
        walletId: wallet.id,
        ...cursorWhere,
      },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
      take: (paginationParams.limit || 10) + 1,
    });

    const hasMore = ledgerEntries.length > (paginationParams.limit || 10);
    const actualEntries = hasMore ? ledgerEntries.slice(0, paginationParams.limit || 10) : ledgerEntries;
    
    let nextCursor: string | undefined;
    if (hasMore && actualEntries.length > 0) {
      const lastEntry = actualEntries[actualEntries.length - 1];
      const timestamp = lastEntry.createdAt.getTime();
      nextCursor = Buffer.from(`${timestamp}-${lastEntry.id}`).toString('base64');
    }

    const response = {
      success: true,
      funds: Number(wallet.funds),
      diamonds: wallet.diamonds,
      ledgerEntries: actualEntries.map(entry => ({
        id: entry.id,
        kind: entry.kind,
        amount: entry.amount,
        currency: entry.currency,
        refType: entry.refType,
        refId: entry.refId,
        note: entry.note,
        createdAt: entry.createdAt.toISOString(),
      })),
      pagination: {
        limit: paginationParams.limit,
        cursor: paginationParams.cursor,
        nextCursor,
        hasMore,
      },
    };

    const nextResponse = NextResponse.json(response);
    
    // Add pagination headers
    const paginationHeaders = buildPaginationHeaders({
      items: actualEntries,
      nextCursor,
      hasMore,
    });
    Object.entries(paginationHeaders).forEach(([key, value]) => {
      nextResponse.headers.set(key, value);
    });

    return nextResponse;
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}
