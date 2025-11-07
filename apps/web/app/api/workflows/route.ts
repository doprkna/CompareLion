import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { prisma } from '@parel/db'
import { toWorkflowDTO, WorkflowDTO } from '@/lib/dto/workflowDTO';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';

export const GET = safeAsync(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return unauthorizedError('Unauthorized');
  }

  const orgId = session.user.orgs && session.user.orgs.length > 0 ? session.user.orgs[0].id : undefined
  if (!orgId) {
    return validationError('No organization found');
  }

  const rawWorkflows = await prisma.workflow.findMany({
    where: { orgId },
    orderBy: { createdAt: 'desc' },
  });
  const workflows: WorkflowDTO[] = rawWorkflows.map(toWorkflowDTO);
  return NextResponse.json(workflows);
});

export const POST = safeAsync(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return unauthorizedError('Unauthorized');
  }

  const body = await request.json()
  const { name, trigger, action, keywords, isActive = true } = body

  const orgId = session.user.orgs && session.user.orgs.length > 0 ? session.user.orgs[0].id : undefined
  if (!orgId) {
    return validationError('No organization found');
  }

  const rawWorkflow = await prisma.workflow.create({
    data: {
      orgId,
      name,
      trigger: trigger as any,
      action: action as any,
      keywords: keywords || [],
      isActive,
    },
  })
  const workflow: WorkflowDTO = toWorkflowDTO(rawWorkflow);
  return NextResponse.json(workflow);
});





