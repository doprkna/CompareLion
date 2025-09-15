import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create demo org
  const org = await prisma.org.create({
    data: {
      name: 'Demo Organization',
    },
  })

  // Create demo user
  const user = await prisma.user.create({
    data: {
      email: 'demo@parel.com',
      name: 'Demo User',
    },
  })

  // Create membership
  await prisma.membership.create({
    data: {
      userId: user.id,
      orgId: org.id,
      role: 'OWNER',
    },
  })

  // Create sample tasks
  const task1 = await prisma.task.create({
    data: {
      orgId: org.id,
      createdById: user.id,
      title: 'Find price for iPhone 15',
      description: 'Need to research the latest iPhone 15 pricing',
      status: 'NEW',
      assigneeType: 'AUTO',
    },
  })

  const task2 = await prisma.task.create({
    data: {
      orgId: org.id,
      createdById: user.id,
      title: 'Schedule team meeting',
      description: 'Set up weekly team sync for next week',
      status: 'ROUTED',
      assigneeType: 'VA',
    },
  })

  // Create workflow
  await prisma.workflow.create({
    data: {
      orgId: org.id,
      name: 'Price Research Workflow',
      trigger: 'KEYWORD',
      action: 'GOOGLE_SEARCH',
      keywords: ['price', 'cost', 'pricing'],
      isActive: true,
    },
  })

  // Create sample messages
  await prisma.message.create({
    data: {
      taskId: task1.id,
      authorType: 'USER',
      text: 'Created task to research iPhone 15 pricing',
    },
  })

  await prisma.message.create({
    data: {
      taskId: task2.id,
      authorType: 'USER',
      text: 'Need help scheduling a team meeting',
    },
  })

  console.log('Seed data created successfully!')
  console.log('Demo user email: demo@parel.com')
  console.log('Demo org:', org.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })





