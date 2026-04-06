/**
 * POST /api/predictions/[id]/answer - Submit prediction answer
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse, authError, validationError } from '@/lib/api-handler';
import { submitPredictionAnswer } from '@/lib/services/predictionService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return authError();

  const { id: predictionId } = await params;
  const body = await req.json().catch(() => ({}));
  const selectedOptionIdx = typeof body?.selectedOptionIdx === 'number' ? body.selectedOptionIdx : undefined;
  if (selectedOptionIdx === undefined) return validationError('selectedOptionIdx required');

  const result = await submitPredictionAnswer(user.id, predictionId, selectedOptionIdx);
  if (!result.success) return validationError(result.error ?? 'Failed to submit');

  return successResponse({ ok: true });
}
