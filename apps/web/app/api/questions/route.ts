import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { QuestionCreateSchema, QuestionUpdateSchema } from '@/lib/validation/question';
import { getQuestionById, getQuestionsBySsscId, createQuestion, updateQuestion, deleteQuestion } from '@/lib/services/questionService';
import { toQuestionDTO, QuestionDTO } from '@/lib/dto/questionDTO';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!(auth as any).user && !(auth as any).error) return auth as NextResponse;

  const id = req.nextUrl.searchParams.get('id');
  const ssscId = req.nextUrl.searchParams.get('ssscId');
  if (id) {
    const q = await getQuestionById(id);
    if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const dto: QuestionDTO = toQuestionDTO(q);
    return NextResponse.json({ success: true, question: dto });
  }
  if (ssscId) {
    const list = await getQuestionsBySsscId(Number(ssscId));
    const dto = list.map(toQuestionDTO);
    const questions: QuestionDTO[] = dto;
    return NextResponse.json({ success: true, questions });
  }
  return NextResponse.json({ error: 'Bad request' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!(auth as any).user && !(auth as any).error) return auth as NextResponse;

  const body = await req.json();
  const parsed = QuestionCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
  const data = parsed.data;
  const created = await createQuestion({
    ssscId: data.ssscId,
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
  return NextResponse.json({ success: true, question: dto }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!(auth as any).user && !(auth as any).error) return auth as NextResponse;

  const body = await req.json();
  const parsed = QuestionUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
  const data = parsed.data;
  if (!data.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const updated = await updateQuestion(data);
  const dto: QuestionDTO = toQuestionDTO(updated);
  return NextResponse.json({ success: true, question: dto });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!(auth as any).user && !(auth as any).error) return auth as NextResponse;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await deleteQuestion(id);
  return NextResponse.json({ success: true });
}
