import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { prisma } from '@parel/db'
import { safeAsync, unauthorizedError, notFoundError } from '@/lib/api-handler';

export const GET = safeAsync(async (
  _request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return unauthorizedError('Unauthorized');
  }

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      creator: true,
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      attachments: true,
      runs: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!task) {
    return notFoundError('Task');
  }

  return NextResponse.json(task)
});

export const PATCH = safeAsync(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return unauthorizedError('Unauthorized');
  }

  const body = await request.json()
  const { status, assigneeType, assigneeId } = body

  const task = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...(status && { status: status as any }),
      ...(assigneeType && { assigneeType: assigneeType as any }),
      ...(assigneeId && { assigneeId }),
    },
  })

  return NextResponse.json(task)
});





