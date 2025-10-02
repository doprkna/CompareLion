export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'active',
    plan: 'basic',
    nextDrip: '2025-11-01'
  });
}
