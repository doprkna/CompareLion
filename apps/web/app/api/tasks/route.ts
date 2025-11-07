import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { prisma } from '@parel/db'
import { enqueueRun } from '@/lib/queue'
import { toTaskDTO, TaskDTO } from '@/lib/dto/taskDTO';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';

export const GET = safeAsync(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return unauthorizedError('Unauthorized');
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const assigneeType = searchParams.get('assigneeType')

  const rawTasks = await prisma.task.findMany({
    where: {
      orgId: session.user.orgs && session.user.orgs.length > 0 ? session.user.orgs[0].id : undefined,
      ...(status && { status: status as any }),
      ...(assigneeType && { assigneeType: assigneeType as any }),
    },
    include: {
      creator: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      runs: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  const tasks: TaskDTO[] = rawTasks.map(toTaskDTO);
  return NextResponse.json(tasks)
});

export const POST = safeAsync(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return unauthorizedError('Unauthorized');
  }

  const body = await request.json()
  const { title, description, priority = 'MEDIUM', assigneeType = 'AUTO' } = body

  if (!title) {
    return validationError('Title is required');
  }

  const orgId = session.user.orgs && session.user.orgs.length > 0 ? session.user.orgs[0].id : undefined
  if (!orgId) {
    return validationError('No organization found');
  }

  const rawTask = await prisma.task.create({
    data: {
      orgId,
      createdById: session.user.id,
      title,
      description,
      priority,
      assigneeType: assigneeType as any,
    },
    include: {
      creator: true,
    },
  })

  // Create initial message
  await prisma.message.create({
    data: {
      taskId: rawTask.id,
      authorType: 'USER',
      text: `Created task: ${title}`,
    },
  })

  // If AUTO, try to find matching workflow and enqueue
  if (assigneeType === 'AUTO') {
    const workflows = await prisma.workflow.findMany({
      where: {
        orgId,
        isActive: true,
        trigger: 'KEYWORD',
      },
    })

    const matchingWorkflow = workflows.find(workflow =>
      workflow.keywords.some(keyword =>
        title.toLowerCase().includes(keyword.toLowerCase()) ||
        (description && description.toLowerCase().includes(keyword.toLowerCase()))
      )
    )

    if (matchingWorkflow) {
      await enqueueRun(rawTask.id, matchingWorkflow.id)
    }
  }

  const task: TaskDTO = toTaskDTO(rawTask);
  return NextResponse.json(task);
});





