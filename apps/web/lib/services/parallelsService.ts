/**
 * Parallels / Similarity Engine (C16)
 * Finds users most similar to the viewer based on answer overlap.
 */

import { prisma } from '@/lib/db';

const MIN_SHARED_QUESTIONS = 3;
const DEFAULT_LIMIT = 5;

function normalizeAnswer(r: { optionIds: string[]; textVal: string | null; numericVal: number | null }): string {
  if (r.optionIds?.length) return r.optionIds.sort().join('|');
  if (r.textVal != null) return `t:${r.textVal}`;
  if (r.numericVal != null) return `n:${r.numericVal}`;
  return '';
}

export interface ParallelUser {
  userId: string;
  name: string;
  location: string;
  similarityPercent: number;
  sharedAnswersCount: number;
  totalComparedQuestions: number;
  biggestDisagreement: { questionText: string; you: string; them: string } | null;
}

/**
 * Get top parallels for a user based on UserResponse overlap.
 * Similarity = (matching answers) / (questions both answered).
 */
export async function getParallels(userId: string, limit = DEFAULT_LIMIT): Promise<ParallelUser[]> {
  const myResponses = await prisma.userResponse.findMany({
    where: { userId, skipped: false },
    select: { questionId: true, optionIds: true, textVal: true, numericVal: true },
  });

  if (myResponses.length === 0) return [];

  const myMap = new Map<string, string>();
  for (const r of myResponses) {
    const key = normalizeAnswer(r);
    if (key) myMap.set(r.questionId, key);
  }

  const myQuestionIds = Array.from(myMap.keys());
  if (myQuestionIds.length < MIN_SHARED_QUESTIONS) return [];

  const questionTexts = await prisma.flowQuestion.findMany({
    where: { id: { in: myQuestionIds } },
    select: { id: true, text: true },
  }).then(rows => new Map(rows.map(q => [q.id, q.text])));

  const optionLabels = await prisma.flowQuestionOption.findMany({
    where: { questionId: { in: myQuestionIds } },
    select: { id: true, label: true, questionId: true },
  }).then(opts => {
    const m = new Map<string, string>();
    for (const o of opts) m.set(`${o.questionId}:${o.id}`, o.label);
    return m;
  });

  const others = await prisma.userResponse.findMany({
    where: {
      userId: { not: userId },
      skipped: false,
      questionId: { in: myQuestionIds },
    },
    select: { userId: true, questionId: true, optionIds: true, textVal: true, numericVal: true },
  });

  const byUser = new Map<string, Array<{ questionId: string; key: string }>>();
  for (const r of others) {
    const key = normalizeAnswer(r);
    if (!key) continue;
    if (!byUser.has(r.userId)) byUser.set(r.userId, []);
    byUser.get(r.userId)!.push({ questionId: r.questionId, key });
  }

  const candidates: Array<{ userId: string; same: number; total: number; disagreements: Array<{ questionId: string; myKey: string; theirKey: string }> }> = [];

  for (const [otherId, theirAnswers] of byUser) {
    const theirMap = new Map(theirAnswers.map(a => [a.questionId, a.key]));
    let same = 0;
    const disagreements: Array<{ questionId: string; myKey: string; theirKey: string }> = [];

    for (const qId of myQuestionIds) {
      const myKey = myMap.get(qId);
      const theirKey = theirMap.get(qId);
      if (!myKey || !theirKey) continue;
      if (myKey === theirKey) same++;
      else disagreements.push({ questionId: qId, myKey, theirKey });
    }

    if (same + disagreements.length >= MIN_SHARED_QUESTIONS) {
      const total = same + disagreements.length;
      candidates.push({ userId: otherId, same, total, disagreements });
    }
  }

  candidates.sort((a, b) => {
    const simA = a.total ? (a.same / a.total) * 100 : 0;
    const simB = b.total ? (b.same / b.total) * 100 : 0;
    return simB - simA;
  });

  const top = candidates.slice(0, limit);
  const userIds = top.map(c => c.userId);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, country: true, countryCode: true, region: true },
  });
  const userMap = new Map(users.map(u => [u.id, u]));

  const result: ParallelUser[] = [];

  for (const c of top) {
    const u = userMap.get(c.userId);
    if (!u) continue;

    const similarityPercent = Math.round((c.same / c.total) * 100);
    let biggestDisagreement: { questionText: string; you: string; them: string } | null = null;

    if (c.disagreements.length > 0) {
      const d = c.disagreements[0];
      const qText = questionTexts.get(d.questionId) || 'Question';
      const formatVal = (k: string) => {
        if (k.startsWith('t:')) return k.slice(2);
        if (k.startsWith('n:')) return k.slice(2);
        const ids = k.split('|');
        return ids.map(id => optionLabels.get(`${d.questionId}:${id}`) || id).join(', ') || k;
      };
      biggestDisagreement = { questionText: qText, you: formatVal(d.myKey), them: formatVal(d.theirKey) };
    }

    const location = [u.country, u.region, u.countryCode].find(Boolean) || '';

    result.push({
      userId: c.userId,
      name: u.name || 'Anonymous',
      location,
      similarityPercent,
      sharedAnswersCount: c.same,
      totalComparedQuestions: c.total,
      biggestDisagreement,
    });
  }

  return result;
}
