import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    console.log('Simple login route called');
    
    const body = await req.json();
    console.log('Request body:', body);
    
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }
    
    // Test database connection
    console.log('Testing database connection...');
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
      }
    });
    
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }
    
    if (!user.password) {
      return NextResponse.json({
        success: false,
        error: 'No password set for this account'
      }, { status: 401 });
    }
    
    // Verify password with bcrypt
    console.log('Verifying password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    
    console.log('Login successful');
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      userId: user.id
    });
    
  } catch (error) {
    console.error('Simple login error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
