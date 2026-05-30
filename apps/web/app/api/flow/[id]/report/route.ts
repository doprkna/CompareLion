import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { safeAsync, validationError } from '@/lib/api-handler';
import { logEvent } from '@/lib/logEvent';
import { prisma } from '@/lib/db';
import { reportFlowQuestion } from '@parel/db';
import { z } from 'zod';

export const runtime = 'nodejs';

const BodySchema = z.object({
  reason: z.string().min(1).max(200).optional(),
  details: z.string().max(2000).optional(),
});

export const POST = safeAsync(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const userId = session.user.id;
  const { id: flowQuestionId } = await params;

  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const result = await reportFlowQuestion(prisma, {
    flowQuestionId,
    userId,
    reason: parsed.data.reason,
    details: parsed.data.details,
  });

  if (!result) {
    return NextResponse.json({ ok: false, error: 'Question not found or report failed' }, { status: 404 });
  }

  logEvent({
    type: 'question_report',
    userId,
    message: 'Reported flow question',
    params: { flowQuestionId, reportId: result.id, channel: 'flow' },
  });

  return NextResponse.json({
    ok: true,
    reportId: result.id,
    sourceQuestionId: result.sourceQuestionId,
  });
});
