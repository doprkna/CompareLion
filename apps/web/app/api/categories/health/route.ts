import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { ensurePrismaClient } from '@/lib/prisma-guard';
import { safeAsync, successResponse, authError } from '@/lib/api-handler';

export const GET = safeAsync(async () => {
  ensurePrismaClient();
  
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return authError('Authentication required');
  }

  // Get all categories with question counts
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          questions: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Define target questions per category
  const TARGET_QUESTIONS = 20;

  // Process categories with health metrics
  const categoryHealth = categories.map(category => {
    const questionCount = category._count.questions;
    const completion = Math.round((questionCount / TARGET_QUESTIONS) * 100);
    
    // Determine health status
    let status: 'empty' | 'low' | 'partial' | 'complete';
    if (questionCount === 0) {
      status = 'empty';
    } else if (questionCount < 5) {
      status = 'low';
    } else if (questionCount < TARGET_QUESTIONS) {
      status = 'partial';
    } else {
      status = 'complete';
    }

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      questions: questionCount,
      targets: TARGET_QUESTIONS,
      completion: Math.min(completion, 100),
      status,
      lastUpdated: category.updatedAt || category.createdAt,
      color: getStatusColor(status),
      needsQuestions: Math.max(0, TARGET_QUESTIONS - questionCount),
    };
  });

  // Calculate summary statistics
  const summary = {
    totalCategories: categories.length,
    emptyCategories: categoryHealth.filter(c => c.status === 'empty').length,
    lowCategories: categoryHealth.filter(c => c.status === 'low').length,
    partialCategories: categoryHealth.filter(c => c.status === 'partial').length,
    completeCategories: categoryHealth.filter(c => c.status === 'complete').length,
    totalQuestions: categoryHealth.reduce((sum, c) => sum + c.questions, 0),
    totalNeeded: categoryHealth.reduce((sum, c) => sum + c.needsQuestions, 0),
  };

  return successResponse({
    categories: categoryHealth,
    summary,
  });
});

function getStatusColor(status: string): string {
  switch (status) {
    case 'empty': return '#ef4444'; // red
    case 'low': return '#f59e0b'; // orange
    case 'partial': return '#eab308'; // yellow
    case 'complete': return '#22c55e'; // green
    default: return '#6b7280'; // gray
  }
}














