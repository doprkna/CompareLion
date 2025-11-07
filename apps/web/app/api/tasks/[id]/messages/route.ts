import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { prisma } from '@parel/db'
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';

export const POST = safeAsync(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return unauthorizedError('Unauthorized');
  }

  const body = await request.json()
  const { text } = body

  if (!text) {
    return validationError('Message text is required');
  }

  const message = await prisma.message.create({
    data: {
      taskId: params.id,
      authorType: 'USER',
      text,
    },
  })

  return NextResponse.json(message)
});





