import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { SssCategoryCreateSchema, SssCategoryUpdateSchema } from '@/lib/validation/sssc';
import { toSssCategoryDTO, SssCategoryDTO } from '@/lib/dto/sssCategoryDTO';
import { getAllSssCategories, createSssCategory } from '@/lib/services/sssCategoryService';

export async function GET(req: NextRequest) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const status = req.nextUrl.searchParams.get('status') ?? undefined;
  const sizeTag = req.nextUrl.searchParams.get('sizeTag') ?? undefined;
  const filters: any = {};
  if (status) filters.status = status;
  if (sizeTag) filters.sizeTag = sizeTag;

  const listRaw = await getAllSssCategories(filters);
  const entries: SssCategoryDTO[] = listRaw.map(toSssCategoryDTO);
  return NextResponse.json({ success: true, entries });
}

export async function POST(req: NextRequest) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();
  const parsed = SssCategoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
  }

  const createdRaw = await createSssCategory(parsed.data);
  const entry: SssCategoryDTO = toSssCategoryDTO(createdRaw);
  return NextResponse.json({ success: true, entry }, { status: 201 });
}