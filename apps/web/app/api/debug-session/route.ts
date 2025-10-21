import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] Session test request received');
    
    const session = await getServerSession(authOptions);
    console.log('[DEBUG] Session object:', JSON.stringify(session, null, 2));
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'No session found',
        debug: 'Session is null/undefined'
      }, { status: 401 });
    }
    
    if (!session.user) {
      return NextResponse.json({
        success: false,
        error: 'No user in session',
        debug: 'Session exists but no user object'
      }, { status: 401 });
    }
    
    if (!session.user.email) {
      return NextResponse.json({
        success: false,
        error: 'No email in user session',
        debug: 'User exists but no email'
      }, { status: 401 });
    }
    
    return NextResponse.json({
      success: true,
      session: {
        user: {
          email: session.user.email,
          name: session.user.name,
          id: session.user.id,
        },
        expires: session.expires,
      },
      debug: 'Session is valid'
    });
  } catch (error) {
    console.error('[DEBUG] Session test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Session test failed',
      debug: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

