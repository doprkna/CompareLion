/**
 * GET /api/admin/translation-suggestions — List translation suggestions (admin)
 * v0.48.06
 */

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/adminApiAuth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const rows = await prisma.translationSuggestion.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    data: {
      suggestions: rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        userEmail: r.user?.email ?? null,
        entityType: r.entityType,
        entityId: r.entityId,
        language: r.language,
        original: r.original,
        suggestion: r.suggestion,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      })),
    },
  });
}
