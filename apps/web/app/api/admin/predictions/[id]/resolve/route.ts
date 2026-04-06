/**
 * POST /api/admin/predictions/[id]/resolve - Admin: resolve prediction
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse, authError, forbiddenError, validationError } from '@/lib/api-handler';
import { requireAdminApi } from '@/lib/adminApiAuth';
import { resolvePrediction } from '@/lib/services/predictionService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const { id: predictionId } = await params;
  const body = await req.json().catch(() => ({}));
  const correctOptionIdx = typeof body?.correctOptionIdx === 'number' ? body.correctOptionIdx : undefined;
  if (correctOptionIdx === undefined) return validationError('correctOptionIdx required');

  const result = await resolvePrediction(predictionId, correctOptionIdx, auth.userId);
  if (!result.success) return validationError(result.error ?? 'Failed to resolve');

  return successResponse({ ok: true, updatedCount: result.updatedCount });
}
