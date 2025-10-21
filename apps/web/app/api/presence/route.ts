import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Handle empty body gracefully
    let body = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (parseError) {
      console.log('[Presence] Empty or invalid body, using defaults');
    }
    
    const { status = 'online' } = body;

    // For now, just acknowledge the presence ping
    // In a real app, you'd update Redis/database with user presence
    console.log(`[Presence] User ${session.user.email} is ${status}`);

    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
      userId: session.user.email,
    });
  } catch (error) {
    console.error('[API] Error handling presence ping:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update presence' },
      { status: 500 }
    );
  }
}