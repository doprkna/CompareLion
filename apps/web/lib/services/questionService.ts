import { prisma } from '@parel/db/src/client';

export async function getQuestionById(id: string) {
  return prisma.question.findUnique({ where: { id } });
}

export async function getQuestionsBySsscId(ssscId: number) {
  // @ts-ignore: allow using ssscId filter until Prisma client is regenerated
  return prisma.question.findMany({ where: { ssscId } });
}

export async function createQuestion(data: any) {
  return prisma.question.create({ data });
}

export async function updateQuestion(data: any & { id: string }) {
  const { id, ...rest } = data;
  return prisma.question.update({ where: { id }, data: rest });
}

export async function deleteQuestion(id: string) {
  // @ts-ignore: status field may not be recognized until Prisma client regenerates
  return prisma.question.update({ where: { id }, data: { status: 'obsolete' } });
}
