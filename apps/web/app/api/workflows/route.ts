import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/options'
import { prisma } from '@parel/db'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orgId = session.user.orgs?.[0]?.id
  if (!orgId) {
    return NextResponse.json({ error: 'No organization found' }, { status: 400 })
  }

  const workflows = await prisma.workflow.findMany({
    where: { orgId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(workflows)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, trigger, action, keywords, isActive = true } = body

  const orgId = session.user.orgs?.[0]?.id
  if (!orgId) {
    return NextResponse.json({ error: 'No organization found' }, { status: 400 })
  }

  const workflow = await prisma.workflow.create({
    data: {
      orgId,
      name,
      trigger: trigger as any,
      action: action as any,
      keywords: keywords || [],
      isActive,
    },
  })

  return NextResponse.json(workflow)
}





