import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, validationError, notFoundError } from '@/lib/api-handler';

type ReactionType = 'like' | 'laugh' | 'think';

interface ReactionBody {
  comparisonId: string;
  type: ReactionType;
}

/**
 * POST /api/reaction
 * { comparisonId: string, type: 'like' | 'laugh' | 'think' }
 * Atomically increments reaction counters on PublicComparison
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const body = (await req.json()) as Partial<ReactionBody>;

  if (!body?.comparisonId || !body?.type) {
    return validationError('comparisonId and type are required');
  }

  if (!['like', 'laugh', 'think'].includes(body.type)) {
    return validationError('Invalid reaction type');
  }

  // Map reaction type to field name
  const fieldMap: Record<ReactionType, keyof typeof data> = {
    like: 'reactionsLike',
    laugh: 'reactionsLaugh',
    think: 'reactionsThink',
  } as any;

  // Build atomic increment dynamically
  const data: any = {};
  data[fieldMap[body.type as ReactionType]] = { increment: 1 };

  const updated = await prisma.publicComparison.update({
    where: { id: body.comparisonId },
    data,
    select: {
      id: true,
      reactionsLike: true,
      reactionsLaugh: true,
      reactionsThink: true,
    },
  }).catch(() => null);

  if (!updated) {
    return notFoundError('PublicComparison');
  }

  return NextResponse.json({ success: true, id: updated.id, reactions: updated });
});


