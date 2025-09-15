import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'
import { prisma } from '@parel/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { text } = body

  if (!text) {
    return NextResponse.json({ error: 'Message text is required' }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: {
      taskId: params.id,
      authorType: 'USER',
      text,
    },
  })

  return NextResponse.json(message)
}





