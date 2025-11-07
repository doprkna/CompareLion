import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { QuestionCreateSchema, QuestionUpdateSchema } from '@/lib/validation/question';
import { getQuestionById, getQuestionsBySsscId, createQuestion, updateQuestion, deleteQuestion } from '@/lib/services/questionService';
import { toQuestionDTO, QuestionDTO } from '@/lib/dto/questionDto';
import { safeAsync, notFoundError, validationError } from '@/lib/api-handler';
import { prisma } from '@/lib/db';
import { getRequestLocale } from '@/lib/locale';
import { getRequestLocaleChain, sortByLocalePreference } from '@/lib/middleware/locale';
import { evaluateContent } from '@/lib/middleware/culturalFilter';

export const GET = safeAsync(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (!(auth as any).user && !(auth as any).error) return auth as NextResponse;

  const id = req.nextUrl.searchParams.get('id');
  const ssscId = req.nextUrl.searchParams.get('ssscId');
  if (id) {
    const q = await getQuestionById(id);
    if (!q) return notFoundError('Question');
    const dto: QuestionDTO = toQuestionDTO(q);
    return NextResponse.json({ success: true, question: dto, timestamp: new Date().toISOString() });
  }
  if (ssscId) {
    const list = await getQuestionsBySsscId(parseInt(ssscId, 10));
    const dto = list.map(toQuestionDTO);
    const questions: QuestionDTO[] = dto;
    return NextResponse.json({ success: true, questions, timestamp: new Date().toISOString() });
  }

  // Localization path: /api/questions?lang=cs&region=CZ
  const { lang, region } = await getRequestLocale(req);
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50', 10), 100);
  const localeChain = await getRequestLocaleChain(req);

  // Tag filtering: includeTags[]=name&excludeTags[]=name
  const includeTags = req.nextUrl.searchParams.getAll('includeTags[]');
  const excludeTags = req.nextUrl.searchParams.getAll('excludeTags[]');

  // Prefer localeCode chain; include approved filter
  const fetched = await prisma.question.findMany({
    where: {
      approved: true,
      OR: [
        { localeCode: { in: localeChain } },
        { localeCode: null },
      ],
      AND: [
        includeTags.length > 0
          ? {
              currentVersion: {
                tags: {
                  some: {
                    tag: { name: { in: includeTags } },
                  },
                },
              },
            }
          : {},
        excludeTags.length > 0
          ? {
              NOT: {
                currentVersion: {
                  tags: {
                    some: {
                      tag: { name: { in: excludeTags } },
                    },
                  },
                },
              },
            }
          : {},
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const results = sortByLocalePreference(fetched, localeChain);

  // Cultural filter: evaluate based on requested region and includeTags
  const evalResult = await evaluateContent({ region, tags: includeTags });
  if (evalResult.action === 'block') {
    const res = NextResponse.json({ success: true, questions: [], filtered: true, reason: 'blocked_by_cultural_filters', region, matched: evalResult.matched, timestamp: new Date().toISOString() });
    res.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return res;
  }

  const dto = results.map(toQuestionDTO);
  const res = NextResponse.json({ success: true, questions: dto, lang, region, localeChain, warning: evalResult.action === 'warn', matched: evalResult.matched, timestamp: new Date().toISOString() });
  res.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
  return res;
});

export const POST = safeAsync(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (!(auth as any).user && !(auth as any).error) return auth as NextResponse;

  const body = await req.json();
  const parsed = QuestionCreateSchema.safeParse(body);
  if (!parsed.success) return validationError('Invalid question data', parsed.error.format());
  const data = parsed.data;
  // @ts-ignore: allow passing unchecked data to createQuestion
  const created = await createQuestion({
    ssscId: parseInt(data.ssscId, 10),
    format: data.format,
    responseType: data.responseType,
    outcome: data.outcome,
    multiplication: data.multiplication,
    difficulty: data.difficulty,
    ageCategory: data.ageCategory,
    gender: data.gender,
    author: data.author,
    wildcard: data.wildcard,
    version: data.version,
    texts: data.texts ? { create: data.texts } : undefined,
  });
  const dto: QuestionDTO = toQuestionDTO(created);
  return NextResponse.json({ success: true, question: dto, timestamp: new Date().toISOString() }, { status: 201 });
});

export const PUT = safeAsync(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (!(auth as any).user && !(auth as any).error) return auth as NextResponse;

  const body = await req.json();
  const parsed = QuestionUpdateSchema.safeParse(body);
  if (!parsed.success) return validationError('Invalid question data', parsed.error.format());
  const data = parsed.data;
  if (!data.id) return validationError('Missing id');

  const updated = await updateQuestion(data);
  const dto: QuestionDTO = toQuestionDTO(updated);
  return NextResponse.json({ success: true, question: dto, timestamp: new Date().toISOString() });
});

export const DELETE = safeAsync(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (!(auth as any).user && !(auth as any).error) return auth as NextResponse;

  const { id } = await req.json();
  if (!id) return validationError('Missing id');
  await deleteQuestion(id);
  return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
});
