import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { safeAsync, successResponse, unauthorizedError } from '@/lib/api-handler';

export const GET = safeAsync(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  // For now, return null since user guild membership isn't implemented yet
  // This will be replaced with actual database queries once the schema is updated
  return successResponse({ data: null });
});
