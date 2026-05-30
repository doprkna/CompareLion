/**
 * GET /api/admin/attention — Question pipeline items needing admin action
 */

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/adminApiAuth';
import { prisma } from '@/lib/db';
import { getAdminAttentionStatus } from '@parel/db';

export const runtime = 'nodejs';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  try {
    const attention = await getAdminAttentionStatus(prisma);
    return NextResponse.json({ ok: true, success: true, attention });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error('[API ERROR]', { route: 'GET /api/admin/attention', error: err });
    return NextResponse.json(
      { ok: false, success: false, error: err.slice(0, 280) },
      { status: 500 }
    );
  }
}
