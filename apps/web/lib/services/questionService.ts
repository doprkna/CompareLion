import { prisma } from '@parel/db/src/client';
import type { Prisma } from '@prisma/client';

export async function getQuestionById(id: string) {
  return prisma.question.findUnique({ where: { id }, include: { texts: true } });
}

export async function getQuestionsBySsscId(ssscId: number) {
  return prisma.question.findMany({ where: { ssscId }, include: { texts: true } });
}

export async function createQuestion(data: Prisma.QuestionCreateInput) {
  return prisma.question.create({ data, include: { texts: true } });
}

export async function updateQuestion(data: Prisma.QuestionUpdateInput & { id: string }) {
  const { id, ...rest } = data;
  return prisma.question.update({ where: { id }, data: { ...rest }, include: { texts: true } });
}

export async function deleteQuestion(id: string) {
  return prisma.question.update({ where: { id }, data: { status: 'obsolete' as any } });
}
