/**
 * Pagination Utilities (v0.11.1)
 * 
 * Standardized pagination for list endpoints.
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

/**
 * Default pagination limits
 */
export const PAGINATION_LIMITS = {
  DEFAULT: 20,
  MAX: 100,
  FEED: 50,
  LEADERBOARD: 100,
  MESSAGES: 30,
  ACTIVITY: 20,
} as const;

/**
 * Parse pagination parameters from request
 */
export function parsePaginationParams(
  searchParams: URLSearchParams
): Required<PaginationParams> {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    PAGINATION_LIMITS.MAX,
    Math.max(1, parseInt(searchParams.get("limit") || String(PAGINATION_LIMITS.DEFAULT), 10))
  );
  const cursor = searchParams.get("cursor") || "";
  
  return { page, limit, cursor };
}

/**
 * Calculate pagination metadata
 */
export function getPaginationMeta(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: getPaginationMeta(page, limit, total),
  };
}

/**
 * Calculate offset for database queries
 */
export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Create cursor-based paginated response
 */
export function createCursorPaginatedResponse<T extends { id: string }>(
  data: T[],
  limit: number
): CursorPaginatedResponse<T> {
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1]?.id || null : null;
  
  return {
    data: items,
    pagination: {
      nextCursor,
      hasMore,
    },
  };
}

/**
 * Prisma pagination helpers
 */
export function getPrismaPagination(page: number, limit: number) {
  return {
    skip: getOffset(page, limit),
    take: limit,
  };
}

/**
 * Cursor-based Prisma pagination
 */
export function getPrismaCursorPagination(cursor: string | null, limit: number) {
  return cursor
    ? {
        take: limit + 1, // Fetch one extra to check hasMore
        skip: 1, // Skip the cursor itself
        cursor: { id: cursor },
      }
    : {
        take: limit + 1,
      };
}










