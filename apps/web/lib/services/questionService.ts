import { prisma } from '@parel/db/src/client';
import { normalizeQuestionText } from '@/lib/text';
import type { AdminUpdateQuestion } from '@parel/validation/questionAdmin';

export async function getQuestionById(id: string) {
  return prisma.question.findUnique({ where: { id } });
}

export async function listQuestionsByLeaf(opts: { ssscId: string; approved?: boolean; take?: number; skip?: number; }) {
  const { ssscId, approved, take = 100, skip = 0 } = opts;
  return prisma.question.findMany({
    where: { ssscId, ...(approved === undefined ? {} : { approved }) },
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  });
}

export async function countQuestionsByLeaf(ssscId: string) {
  const [total, approvedCount, unapprovedCount] = await Promise.all([
    prisma.question.count({ where: { ssscId } }),
    prisma.question.count({ where: { ssscId, approved: true } }),
    prisma.question.count({ where: { ssscId, approved: false } }),
  ]);
  return { total, approved: approvedCount, unapproved: unapprovedCount };
}

export async function adminUpdateQuestion(id: string, patch: AdminUpdateQuestion) {
  const data: any = { ...patch };
  if (patch.text) {
    data.text = patch.text.trim();
    data.normalizedText = normalizeQuestionText(patch.text);
  }
  return prisma.question.update({ where: { id }, data });
}

export async function bulkApproveQuestions(ids: string[]) {
  if (!ids.length) return { updated: 0 };
  const res = await prisma.question.updateMany({
    where: { id: { in: ids } },
    data: { approved: true },
  });
  return { updated: res.count };
}

/**
 * Find likely duplicate questions by normalizedText in a given leaf
 */
export async function findLikelyDuplicates(ssscId: string): Promise<Array<{ normalizedText: string; ids: string[] }>> {
  const rows = await prisma.question.findMany({
    where: { ssscId },
    select: { id: true, normalizedText: true },
  });
  const groups: Record<string, string[]> = {};
  for (const { id, normalizedText } of rows) {
    if (!normalizedText) continue;
    groups[normalizedText] = groups[normalizedText] || [];
    groups[normalizedText].push(id);
  }
  return Object.entries(groups)
    .filter(([, ids]) => ids.length > 1)
    .map(([normalizedText, ids]) => ({ normalizedText, ids }));
}

// Public CRUD for questions
export async function getQuestionsBySsscId(ssscId: number) {
  return prisma.question.findMany({ where: { ssscId: String(ssscId) }, orderBy: { createdAt: 'desc' } });
}

export async function createQuestion(data: any) {
  // Convert ssscId to string if needed
  const { ssscId, ...rest } = data;
  return prisma.question.create({ data: { ...rest, ssscId: String(ssscId) } });
}

export async function updateQuestion(data: any) {
  const { id, ...rest } = data;
  return prisma.question.update({ where: { id }, data: rest });
}

export async function deleteQuestion(id: string) {
  return prisma.question.delete({ where: { id } });
}
