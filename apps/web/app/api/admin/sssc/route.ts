import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@parel/db/src/client';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const params = req.nextUrl.searchParams;
  const status = params.get('status') || undefined;
  const take = params.get('take') ? parseInt(params.get('take') as string, 10) : undefined;
  const skip = params.get('skip') ? parseInt(params.get('skip') as string, 10) : undefined;

  const where: any = {};
  if (status) where.status = status;
  const ssscs = await prisma.sssCategory.findMany({
    where,
    take,
    skip,
    include: {
      subSubCategory: {
        include: {
          subCategory: {
            include: { category: true }
          }
        }
      }
    }
  });

  const result = await Promise.all(ssscs.map(async s => {
    const path = [
      s.subSubCategory.subCategory.category.name,
      s.subSubCategory.subCategory.name,
      s.subSubCategory.name,
      s.name
    ].join(' / ');
    const questionCount = await prisma.question.count({ where: { ssscId: s.id } });
    return {
      id: s.id,
      path,
      status: s.status,
      generatedAt: s.generatedAt,
      error: s.error,
      questionCount
    };
  }));

  return NextResponse.json(result);
}
