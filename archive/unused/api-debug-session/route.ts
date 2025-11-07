import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, successResponse, unauthorizedError } from '@/lib/api-handler';

export const GET = safeAsync(async (_request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return unauthorizedError('No session found');
  }
  
  if (!session.user) {
    return unauthorizedError('No user in session');
  }
  
  if (!session.user.email) {
    return unauthorizedError('No email in user session');
  }
  
  return successResponse({
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
});

