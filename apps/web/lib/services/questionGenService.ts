import { questionGenQueue, QuestionGenJob } from '@/lib/jobs/questionGen.queue';

export async function enqueueSSSCGeneration(payload: QuestionGenJob) {
  return questionGenQueue.add(
    'generate-sssc',
    payload,
    {
      jobId: `qgen:${payload.ssscId}:${payload.targetCount ?? 10}:${payload.overwrite ? 'ow' : 'no'}`,
    }
  );
}
