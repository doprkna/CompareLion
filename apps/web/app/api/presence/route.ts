import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, successResponse, unauthorizedError } from '@/lib/api-handler';

export const POST = safeAsync(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  // Handle empty body gracefully
  let body: any = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text);
    }
  } catch (parseError) {
    // Ignore parse errors for empty bodies
  }
  
  const { status = 'online' } = body;

  // For now, just acknowledge the presence ping
  // In a real app, you'd update Redis/database with user presence

  return successResponse({
    status,
    userId: session.user.email,
  });
});