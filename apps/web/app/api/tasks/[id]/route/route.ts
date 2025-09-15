import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'
import { prisma } from '@parel/db'
import { enqueueRun } from '@/lib/queue'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { assigneeType } = body

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: { org: true },
  })

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const updatedTask = await prisma.task.update({
    where: { id: params.id },
    data: {
      assigneeType: assigneeType as any,
      status: assigneeType === 'AUTO' ? 'NEW' : 'ROUTED',
    },
  })

  // If switching to AUTO, try to find matching workflow
  if (assigneeType === 'AUTO') {
    const workflows = await prisma.workflow.findMany({
      where: {
        orgId: task.orgId,
        isActive: true,
        trigger: 'KEYWORD',
      },
    })

    const matchingWorkflow = workflows.find(workflow =>
      workflow.keywords.some(keyword =>
        task.title.toLowerCase().includes(keyword.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(keyword.toLowerCase()))
      )
    )

    if (matchingWorkflow) {
      await enqueueRun(task.id, matchingWorkflow.id)
    }
  }

  return NextResponse.json(updatedTask)
}





