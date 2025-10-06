import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    console.log('Test login route called');
    
    const body = await req.json();
    console.log('Request body:', body);
    
    // Test database connection
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    // Test finding a user
    const user = await prisma.user.findUnique({
      where: { email: body.email || 'demo@example.com' },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      }
    });
    
    console.log('User found:', user ? 'Yes' : 'No');
    
    return NextResponse.json({
      success: true,
      message: 'Test login route working',
      userCount,
      userFound: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        hasPassword: !!user.passwordHash
      } : null
    });
    
  } catch (error) {
    console.error('Test login error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
