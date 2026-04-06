import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { recordFlowAnswer, getUserFlowStats } from '@/lib/services/flowService';
import { addXP, updateHeroStats } from '@/lib/services/progressionService';
import { publishEvent } from '@/lib/realtime';
import { safeAsync, validationError, notFoundError } from '@/lib/api-handler';
import { logEvent } from '@/lib/logEvent';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import type { QuestionType } from '@prisma/client';

export const runtime = 'nodejs';

const BodySchema = z.object({
  optionIds: z.array(z.string().min(1)).optional().default([]),
  textValue: z.string().optional(),
  numericValue: z.number().optional(),
});

function isMultiType(t: string) {
  return t === 'MULTI_CHOICE' || t === 'MULTIPLE_CHOICE';
}

function validateFlowAnswer(
  type: QuestionType,
  options: ReadonlyArray<{ id: string }>,
  parsed: z.infer<typeof BodySchema>
): string | null {
  const validIds = new Set(options.map((o) => o.id));
  const optIds = parsed.optionIds ?? [];

  for (const id of optIds) {
    if (!validIds.has(id)) return 'Invalid option selection';
  }

  switch (type) {
    case 'SINGLE_CHOICE':
      if (options.length > 0) {
        if (optIds.length !== 1) return 'Select exactly one option';
      } else if (!parsed.textValue?.trim() && parsed.numericValue == null) {
        return 'Provide an answer';
      }
      break;
    case 'MULTI_CHOICE':
      if (optIds.length < 1) return 'Select at least one option';
      break;
    case 'TEXT':
      if (!parsed.textValue?.trim()) return 'Enter text';
      break;
    case 'RANGE': {
      if (parsed.numericValue == null || Number.isNaN(parsed.numericValue)) return 'Enter a valid number';
      const r = Math.round(parsed.numericValue);
      if (r < 1 || r > 10) return 'Value must be between 1 and 10';
      break;
    }
    case 'NUMBER':
      if (parsed.numericValue == null || Number.isNaN(parsed.numericValue)) return 'Enter a valid number';
      break;
    default:
      if (isMultiType(type) && optIds.length < 1) return 'Select at least one option';
      if (!isMultiType(type) && options.length > 0 && optIds.length < 1) return 'Select an option';
      break;
  }
  return null;
}

export const POST = safeAsync(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const userId = session.user.id;
  const { id: questionId } = await params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return validationError('Invalid body', parsed.error.flatten());
  }

  const fq = await prisma.flowQuestion.findUnique({
    where: { id: questionId },
    include: {
      options: { orderBy: { order: 'asc' } },
    },
  });
  if (!fq) {
    return notFoundError('Question');
  }

  const validationMessage = validateFlowAnswer(fq.type, fq.options, parsed.data);
  if (validationMessage) {
    return validationError(validationMessage);
  }

  const optIds = parsed.data.optionIds ?? [];
  const numericValue =
    fq.type === 'RANGE' && parsed.data.numericValue != null && !Number.isNaN(parsed.data.numericValue)
      ? Math.min(10, Math.max(1, Math.round(parsed.data.numericValue)))
      : parsed.data.numericValue;

  await recordFlowAnswer({
    userId,
    questionId,
    optionIds: optIds,
    textValue: parsed.data.textValue,
    numericValue,
    skipped: false,
  });

  logEvent({
    type: 'question_answer',
    userId,
    message: 'Answered question',
    params: {
      questionId,
      channel: 'flow_category',
      optionCount: optIds.length,
    },
  });

  const xpReward = 10;
  const xpResult = await addXP(userId, xpReward, 'flow_answer');
  await updateHeroStats(userId);
  await publishEvent('xp:update', {
    userId,
    newXp: xpResult.xp,
    newLevel: xpResult.level,
    leveledUp: xpResult.leveledUp,
    xpGained: xpReward,
  });

  const stats = await getUserFlowStats(userId);

  return NextResponse.json({
    status: 'answered',
    timestamp: new Date().toISOString(),
    stats: {
      totalAnswered: stats.totalAnswered,
      todayAnswered: stats.todayAnswered,
      xpGained: xpReward,
    },
    level: xpResult.level,
    leveledUp: xpResult.leveledUp,
  });
});
