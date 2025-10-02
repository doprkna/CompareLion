import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { AdminUpdateQuestionDto } from '@/lib/validation/questionAdmin';
import { adminUpdateQuestion } from '@/lib/services/questionService';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json();
  const parsed = AdminUpdateQuestionDto.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const updated = await adminUpdateQuestion(params.id, parsed.data);
  return NextResponse.json(updated);
}
