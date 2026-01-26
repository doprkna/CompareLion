import { Worker } from 'bullmq';
import { prisma } from '@parel/db/src/client';
import { getLeafContext } from '@parel/db/src/leaf';
import { buildPrompt } from '@/lib/prompts/generateQuestions';
import { GeneratedQuestions } from '@parel/validation/questionGen';
import { normalizeQuestionText } from '@/lib/text';
import { callAI } from '@/lib/ai';
import type { Job } from 'bullmq';

export async function processQuestionGenJob(job: Job) {
  const { ssscId, targetCount = 10, overwrite = false, model } = job.data;
  const ctx = await getLeafContext(ssscId);
  const existing = await prisma.question.count({ where: { ssscId } });
  const need = Math.max(0, targetCount - (overwrite ? 0 : existing));
  if (need === 0) return { skipped: true, reason: 'already_satisfied' };
  const prompt = buildPrompt({ names: ctx.names, locale: ctx.locale, targetCount: need });
  const genLog = await prisma.questionGeneration.create({
    data: { id: job.id as string, ssscId, targetCount: need, status: 'pending', prompt: JSON.stringify(prompt) }
  });
  let raw = await callAI({ ...prompt, model: model ?? process.env.AI_MODEL_QUESTION_GEN });
  let parsed = null;
  try {
    parsed = GeneratedQuestions.parse(JSON.parse(raw));
  } catch {
    const repair = `The previous output was invalid. Fix to match schema exactly. Return only valid JSON.`;
    raw = await callAI({ system: prompt.system, user: prompt.user + "\n\n" + repair, model: model ?? process.env.AI_MODEL_QUESTION_GEN });
    parsed = GeneratedQuestions.parse(JSON.parse(raw));
  }
  let insertedCount = 0;
  for (const q of parsed.questions) {
    const normalizedText = normalizeQuestionText(q.text);
    try {
      await prisma.question.create({
        data: {
          text: q.text.trim(),
          normalizedText,
          difficulty: q.difficulty ?? 'medium',
          categoryId: ctx.ids.categoryId,
          subCategoryId: ctx.ids.subCategoryId ?? null,
          subSubCategoryId: ctx.ids.subSubCategoryId ?? null,
          ssscId: ctx.ids.ssscId
        }
      });
      insertedCount++;
    } catch (e: any) {
      if (!String(e?.code).includes('P2002')) throw e;
    }
  }
  await prisma.questionGeneration.update({
    where: { id: genLog.id },
    data: { status: insertedCount > 0 ? 'success' : 'failed', insertedCount, rawResponse: raw, finishedAt: new Date() }
  });
  // Update leaf status based on generation result
  await prisma.sssCategory.update({
    where: { id: ssscId },
    data: { status: insertedCount > 0 ? 'done' : 'failed', generatedAt: new Date(), ...(insertedCount === 0 && { error: 'generation_failed' }) }
  });
  return { insertedCount };
}

export const questionGenWorker = new Worker(
  'question-gen',
  processQuestionGenJob,
  {
    connection: { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
    concurrency: Number(process.env.QGEN_CONCURRENCY ?? 2),
    limiter: { max: Number(process.env.QGEN_RATE_MAX ?? 60), duration: 60_000 },
  }
);
