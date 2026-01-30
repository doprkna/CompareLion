import { Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import { prisma } from '@parel/db'

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

interface RunJobData {
  taskId: string
  workflowId?: string
}

const worker = new Worker<RunJobData>('run-queue', async (job: Job<RunJobData>) => {
  const { taskId, workflowId } = job.data
  
  console.log(`Processing run for task ${taskId}, workflow ${workflowId}`)
  
  try {
    // Update run status to RUNNING
    const run = await prisma.run.create({
      data: {
        taskId,
        workflowId,
        status: 'RUNNING',
        logs: { message: 'Starting workflow execution' },
      },
    })

    // Get task details
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      throw new Error(`Task ${taskId} not found`)
    }

    // Fetch workflow by id (Task has no workflow relation; Run has workflowId)
    const workflow = workflowId
      ? await prisma.workflow.findUnique({ where: { id: workflowId } })
      : null

    // Update task status
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'IN_PROGRESS' },
    })

    // Simulate workflow execution based on action type
    let result: any = {}
    const desc = task.description ?? undefined
    
    if (workflowId && workflow) {
      switch (workflow.action) {
        case 'GOOGLE_SEARCH':
          result = await simulateGoogleSearch(task.title, desc)
          break
        case 'WEB_SCRAPE':
          result = await simulateWebScrape(task.title)
          break
        case 'DOC_SUMMARY':
          result = await simulateDocSummary(task.description || '')
          break
        case 'CUSTOM':
          result = await simulateCustomAction(task.title, desc)
          break
        default:
          result = { message: 'Unknown action type' }
      }
    } else {
      // Default action for tasks without specific workflow
      result = await simulateDefaultAction(task.title, desc)
    }

    // Update run with results
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: 'SUCCEEDED',
        logs: {
          message: 'Workflow completed successfully',
          result,
          completedAt: new Date().toISOString(),
        },
      },
    })

    // Add result message to task
    await prisma.taskMessage.create({
      data: {
        taskId,
        authorType: 'SYSTEM',
        text: `Workflow completed: ${JSON.stringify(result, null, 2)}`,
      },
    })

    // Update task status to DONE
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'DONE' },
    })

    console.log(`Successfully processed task ${taskId}`)
    
  } catch (error) {
    console.error(`Error processing task ${taskId}:`, error)
    
    // Update run with error
    await prisma.run.updateMany({
      where: { taskId },
      data: {
        status: 'FAILED',
        logs: {
          error: error instanceof Error ? error.message : 'Unknown error',
          failedAt: new Date().toISOString(),
        },
      },
    })

    // Add error message to task
    await prisma.taskMessage.create({
      data: {
        taskId,
        authorType: 'SYSTEM',
        text: `Workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
    })

    // Update task status to BLOCKED
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'BLOCKED' },
    })
  }
}, { connection })

// Simulate different workflow actions
async function simulateGoogleSearch(title: string, description?: string): Promise<any> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return {
    action: 'GOOGLE_SEARCH',
    query: `${title} ${description || ''}`.trim(),
    results: [
      {
        title: `Search result for ${title}`,
        url: 'https://example.com/result1',
        snippet: `This is a simulated search result for ${title}`,
      },
      {
        title: `Another result for ${title}`,
        url: 'https://example.com/result2',
        snippet: `Additional information about ${title}`,
      },
    ],
    timestamp: new Date().toISOString(),
  }
}

async function simulateWebScrape(title: string): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    action: 'WEB_SCRAPE',
    url: `https://example.com/${title.toLowerCase().replace(/\s+/g, '-')}`,
    content: `Scraped content for ${title}`,
    extractedData: {
      title,
      description: `This is scraped content for ${title}`,
      links: ['https://example.com/link1', 'https://example.com/link2'],
    },
    timestamp: new Date().toISOString(),
  }
}

async function simulateDocSummary(description: string): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    action: 'DOC_SUMMARY',
    originalText: description,
    summary: `Summary: ${description.substring(0, 100)}...`,
    keyPoints: [
      'Key point 1 from the document',
      'Key point 2 from the document',
      'Key point 3 from the document',
    ],
    timestamp: new Date().toISOString(),
  }
}

async function simulateCustomAction(title: string, description?: string): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  return {
    action: 'CUSTOM',
    input: { title, description },
    output: `Custom processing completed for: ${title}`,
    metadata: {
      processedAt: new Date().toISOString(),
      processingTime: '3s',
    },
  }
}

async function simulateDefaultAction(title: string, description?: string): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    action: 'DEFAULT',
    message: `Default processing completed for task: ${title}`,
    details: description || 'No description provided',
    timestamp: new Date().toISOString(),
  }
}

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

worker.on('error', (err) => {
  console.error('Worker error:', err)
})

console.log('Worker started, waiting for jobs...')

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down worker...')
  await worker.close()
  process.exit(0)
})





