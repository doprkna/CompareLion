/**
 * Distance Rule System v1 (C19)
 *
 * Prevents similar questions appearing too close together.
 * Distance = number of questions shown, not time.
 * Filtering layer only; does not redesign the question engine.
 */
import { prisma } from '../../db';

// --- Configuration ---

export const distanceRules = {
  question: 500,
  subcategory: 100,
  category: 200,
  tag: 120
} as const;

export const HISTORY_LIMIT = 500;
const MIN_CANDIDATES_AFTER_FILTER = 3;

// --- Types ---

export interface RecentQuestionEntry {
  questionId: string;
  categoryId: string | null;
  subSubCategoryId: string | null;
  tags: string[];
}

export interface HistoryIndex {
  questionIdsInLastN: Set<string>;
  subcategoryIdsInLast100: Set<string>;
  categoryIdsInLast200: Set<string>;
  tagsInLast120: Set<string>;
}

export interface CandidateQuestion {
  id: string;
  categoryId: string | null;
  subSubCategoryId: string | null;
  tags: string[];
  arcStep?: string | null;
}

// --- Data Abstraction ---

/**
 * Get recent question history for a user.
 * Uses UserResponse (answers). Can be extended to use user_question_history if present.
 */
export async function getRecentQuestionHistory(
  userId: string,
  limit: number = HISTORY_LIMIT
): Promise<RecentQuestionEntry[]> {
  const responses = await prisma.userResponse.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: {
      questionId: true,
      question: {
        select: {
          categoryId: true,
          category: {
            select: { subSubCategoryId: true }
          },
          tags: true
        }
      }
    }
  });

  return responses.map(r => ({
    questionId: r.questionId,
    categoryId: r.question?.categoryId ?? null,
    subSubCategoryId: r.question?.category?.subSubCategoryId ?? null,
    tags: Array.isArray(r.question?.tags) ? r.question.tags : []
  }));
}

/**
 * Build an in-memory index from history for fast distance checks.
 * Order: index 0 = most recent.
 */
export function buildHistoryIndex(history: RecentQuestionEntry[]): HistoryIndex {
  const last500 = history.slice(0, distanceRules.question);
  const last100 = history.slice(0, distanceRules.subcategory);
  const last200 = history.slice(0, distanceRules.category);
  const last120 = history.slice(0, distanceRules.tag);

  // subcategory = SssCategory (flow topic); category = SubSubCategory (broader group)
  return {
    questionIdsInLastN: new Set(last500.map(e => e.questionId)),
    subcategoryIdsInLast100: new Set(
      last100.map(e => e.categoryId).filter((id): id is string => !!id)
    ),
    categoryIdsInLast200: new Set(
      last200
        .map(e => e.subSubCategoryId)
        .filter((id): id is string => !!id)
    ),
    tagsInLast120: new Set(
      last120.flatMap(e => e.tags).filter(Boolean)
    )
  };
}

// --- Filter Pipeline ---

function applyExactDistance(
  candidates: CandidateQuestion[],
  index: HistoryIndex
): CandidateQuestion[] {
  return candidates.filter(c => !index.questionIdsInLastN.has(c.id));
}

function applySubcategoryDistance(
  candidates: CandidateQuestion[],
  index: HistoryIndex,
  flowCategoryId: string | null
): CandidateQuestion[] {
  // subcategory = SssCategory (categoryId). Flow exception: relax for current flow topic
  if (flowCategoryId) {
    return candidates.filter(c => {
      if (c.categoryId === flowCategoryId) return true;
      if (!c.categoryId) return true;
      return !index.subcategoryIdsInLast100.has(c.categoryId);
    });
  }
  return candidates.filter(c => {
    if (!c.categoryId) return true;
    return !index.subcategoryIdsInLast100.has(c.categoryId);
  });
}

function applyCategoryDistance(
  candidates: CandidateQuestion[],
  index: HistoryIndex,
  flowCategoryId: string | null
): CandidateQuestion[] {
  // category = SubSubCategory. Flow exception: relax for current flow topic
  if (flowCategoryId) {
    return candidates.filter(c => {
      if (c.categoryId === flowCategoryId) return true;
      if (!c.subSubCategoryId) return true;
      return !index.categoryIdsInLast200.has(c.subSubCategoryId);
    });
  }
  return candidates.filter(c => {
    if (!c.subSubCategoryId) return true;
    return !index.categoryIdsInLast200.has(c.subSubCategoryId);
  });
}

function applyTagDistance(
  candidates: CandidateQuestion[],
  index: HistoryIndex
): CandidateQuestion[] {
  return candidates.filter(c => {
    if (!c.tags?.length) return true; // Skip when no tags
    const shared = c.tags.some(t => index.tagsInLast120.has(t));
    return !shared;
  });
}

/**
 * Apply all distance filters. Exact question distance is always enforced.
 * Returns filtered candidates. If too few remain, retries with relaxed category/subcategory.
 */
export function applyDistanceFilters(
  candidates: CandidateQuestion[],
  index: HistoryIndex,
  flowCategoryId: string | null,
  options?: { relaxIfTooFew?: boolean }
): CandidateQuestion[] {
  const relax = options?.relaxIfTooFew !== false;

  let filtered = applyExactDistance(candidates, index);
  filtered = applySubcategoryDistance(filtered, index, flowCategoryId);
  filtered = applyCategoryDistance(filtered, index, flowCategoryId);
  filtered = applyTagDistance(filtered, index);

  // Fallback: relax category/subcategory if too few candidates; keep exact always
  if (relax && filtered.length < MIN_CANDIDATES_AFTER_FILTER && candidates.length > filtered.length) {
    filtered = applyExactDistance(candidates, index);
    filtered = applyTagDistance(filtered, index);
    // Skip subcategory and category distance when relaxing
  }

  return filtered;
}
