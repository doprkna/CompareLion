import { prisma } from '@parel/db/src/client';

export async function generateAndInsertOneQuestion(ssscId: number, runVersion: string) {
  // Determine defaults for a new question
  const created = await prisma.question.create({
    data: {
      ssscId,
      format: 'WYR',
      responseType: 'Y/N',
      outcome: 'Continue',
      multiplication: 1,
      difficulty: 1,
      ageCategory: null,
      gender: null,
      author: 'auto',
      wildcard: {},
      version: runVersion,
      texts: {
        create: [{ lang: 'en', text: `Auto test question for SSSC #${ssscId}` }],
      },
    },
  });
  return created;
}
