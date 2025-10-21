import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    console.log('[DEBUG-PRISMA] Testing Prisma client...');
    
    // Test 1: Simple query
    console.log('[DEBUG-PRISMA] Test 1: Simple SELECT 1');
    await prisma.$queryRaw`SELECT 1`;
    console.log('[DEBUG-PRISMA] ✅ SELECT 1 succeeded');
    
    // Test 2: Read from database
    console.log('[DEBUG-PRISMA] Test 2: Count users');
    const userCount = await prisma.user.count();
    console.log('[DEBUG-PRISMA] ✅ User count:', userCount);
    
    // Test 3: Write to database (create a test UserResponse)
    console.log('[DEBUG-PRISMA] Test 3: Create test UserResponse');
    
    // Get first user and first question for test
    const testUser = await prisma.user.findFirst();
    const testQuestion = await prisma.flowQuestion.findFirst();
    
    if (!testUser || !testQuestion) {
      throw new Error('No test user or question available');
    }
    
    console.log('[DEBUG-PRISMA] Test user ID:', testUser.id);
    console.log('[DEBUG-PRISMA] Test question ID:', testQuestion.id);
    
    // Try to create a test response
    const testResponse = await prisma.userResponse.create({
      data: {
        userId: testUser.id,
        questionId: testQuestion.id,
        skipped: true,
        timeMs: 0,
      },
    });
    
    console.log('[DEBUG-PRISMA] ✅ Test response created:', testResponse.id);
    
    // Clean up - delete the test response
    await prisma.userResponse.delete({
      where: { id: testResponse.id },
    });
    
    console.log('[DEBUG-PRISMA] ✅ Test response cleaned up');
    
    return NextResponse.json({
      ok: true,
      id: testResponse.id,
      tests: {
        selectQuery: true,
        userCount: userCount,
        createResponse: true,
        cleanup: true,
      },
      message: 'All Prisma tests passed! Database is working correctly.',
    });
  } catch (error) {
    console.error('======================================');
    console.error('[🧨 PRISMA TEST ERROR]', error);
    console.error('[ERROR] Full error:', JSON.stringify(error, null, 2));
    console.error('[ERROR] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[ERROR] Error name:', (error as any)?.name);
    console.error('[ERROR] Error code:', (error as any)?.code);
    console.error('[ERROR] Error meta:', (error as any)?.meta);
    console.error('[ERROR] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    console.error('======================================');
    
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorDetails: {
          name: (error as any)?.name,
          code: (error as any)?.code,
          meta: (error as any)?.meta,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
