import { NextRequest, NextResponse } from 'next/server';
import { safeAsync, validationError, notFoundError } from '@/lib/api-handler';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// POST /api/question/[id]/tags
// Body: { tags: string[] } where tags are names
export const POST = safeAsync(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const auth = await requireAuth(req);
  if (!(auth as any).user && !(auth as any).error) return auth as NextResponse;

  const { id } = params;
  const body = await req.json().catch(() => ({}));
  const tags: string[] = Array.isArray(body?.tags) ? body.tags : [];
  if (tags.length === 0) return validationError('Provide tags: string[]');

  const q = await prisma.question.findUnique({
    where: { id },
    select: { id: true, currentVersionId: true },
  });
  if (!q) return notFoundError('Question');
  if (!q.currentVersionId) return validationError('Question has no current version to tag');

  // Ensure tag rows exist and connect via QuestionVersionTag
  const ensured = await Promise.all(
    tags.map(async (name) => {
      const t = await prisma.questionTag.upsert({
        where: { name },
        update: {},
        create: { name, type: 'tone' },
      });
      return t;
    })
  );

  // Enforce 5–7 tags per question (soft limit): cap at 7
  const existing = await prisma.questionVersionTag.findMany({
    where: { questionVersionId: q.currentVersionId },
    select: { tagId: true },
  });
  const existingIds = new Set(existing.map((e) => e.tagId));

  const toAdd = ensured.filter((t) => !existingIds.has(t.id)).slice(0, Math.max(0, 7 - existingIds.size));

  await prisma.questionVersionTag.createMany({
    data: toAdd.map((t) => ({ questionVersionId: q.currentVersionId!, tagId: t.id })),
    skipDuplicates: true,
  });

  const finalTags = await prisma.questionVersionTag.findMany({
    where: { questionVersionId: q.currentVersionId },
    include: { tag: true },
  });

  return NextResponse.json({
    success: true,
    questionId: id,
    versionId: q.currentVersionId,
    tags: finalTags.map((x) => x.tag),
    timestamp: new Date().toISOString(),
  });
});


