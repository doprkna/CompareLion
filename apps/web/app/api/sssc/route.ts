import { NextRequest, NextResponse } from 'next/server';
import { SssCategoryCreateSchema, SssCategoryUpdateSchema } from '@/lib/validation/sssc';
import { toSssCategoryDTO } from '@/lib/dto/sssCategoryDTO';
import { getAllSssCategories, createSssCategory } from '@/lib/services/sssCategoryService';

export async function GET(req: NextRequest) {
  // Auth
  const auth = await requireAuth(req);