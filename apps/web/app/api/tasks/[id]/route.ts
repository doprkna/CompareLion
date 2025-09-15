import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/options'
import { prisma } from '@parel/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json(task)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
}





