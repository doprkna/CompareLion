import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@parel/db/src/client';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const totalLeaves = await prisma.sssCategory.count();
  const completed = await prisma.sssCategory.count({ where: { status: 'done' } });
  const failed = await prisma.sssCategory.count({ where: { status: 'failed' } });
  const pending = await prisma.sssCategory.count({ where: { status: 'pending' } });

  const totalQuestions = await prisma.question.count();
  const avgQuestionsPerLeaf = totalLeaves > 0 ? totalQuestions / totalLeaves : 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayJobs = await prisma.questionGeneration.count({ where: { createdAt: { gte: todayStart } } });
  const todaySuccess = await prisma.questionGeneration.count({ where: { createdAt: { gte: todayStart }, status: 'success' } });
  const todayFail = await prisma.questionGeneration.count({ where: { createdAt: { gte: todayStart }, status: 'failed' } });

  return NextResponse.json({
    totalLeaves,
    completed,
    failed,
    pending,
    avgQuestionsPerLeaf,
    todayJobs,
    todaySuccess,
    todayFail,
  });
}
