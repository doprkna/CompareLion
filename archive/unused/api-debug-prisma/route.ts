import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, serverError } from '@/lib/api-handler';
import { logger } from '@/lib/logger';

const runPrismaTest = safeAsync(async (_req: NextRequest) => {
  // Test 1: Simple query
  await prisma.$queryRaw`SELECT 1`;
  
  // Test 2: Read from database
  const userCount = await prisma.user.count();
  
  // Test 3: Write to database (create a test UserResponse)
  
  // Get first user and first question for test
  const testUser = await prisma.user.findFirst();
  const testQuestion = await prisma.flowQuestion.findFirst();
  
  if (!testUser || !testQuestion) {
    // Log diagnostic info for debugging
    logger.error('[DEBUG-PRISMA] No test user or question available');
    return serverError('No test user or question available');
  }
  
  // Try to create a test response
  const testResponse = await prisma.userResponse.create({
    data: {
      userId: testUser.id,
      questionId: testQuestion.id,
      skipped: true,
      timeMs: 0,
    },
  });
  
  // Clean up - delete the test response
  await prisma.userResponse.delete({
    where: { id: testResponse.id },
  });
  
  return successResponse({
    id: testResponse.id,
    tests: {
      selectQuery: true,
      userCount: userCount,
      createResponse: true,
      cleanup: true,
    },
  }, 'All Prisma tests passed! Database is working correctly.');
});

export const POST = runPrismaTest;
export const GET = runPrismaTest;
