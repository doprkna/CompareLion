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
export declare const PAGINATION_LIMITS: {
    readonly DEFAULT: 20;
    readonly MAX: 100;
    readonly FEED: 50;
    readonly LEADERBOARD: 100;
    readonly MESSAGES: 30;
    readonly ACTIVITY: 20;
};
/**
 * Parse pagination parameters from request
 */
export declare function parsePaginationParams(searchParams: URLSearchParams): Required<PaginationParams>;
/**
 * Calculate pagination metadata
 */
export declare function getPaginationMeta(page: number, limit: number, total: number): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};
/**
 * Create paginated response
 */
export declare function createPaginatedResponse<T>(data: T[], page: number, limit: number, total: number): PaginatedResponse<T>;
/**
 * Calculate offset for database queries
 */
export declare function getOffset(page: number, limit: number): number;
/**
 * Create cursor-based paginated response
 */
export declare function createCursorPaginatedResponse<T extends {
    id: string;
}>(data: T[], limit: number): CursorPaginatedResponse<T>;
/**
 * Prisma pagination helpers
 */
export declare function getPrismaPagination(page: number, limit: number): {
    skip: number;
    take: number;
};
/**
 * Cursor-based Prisma pagination
 */
export declare function getPrismaCursorPagination(cursor: string | null, limit: number): {
    take: number;
    skip: number;
    cursor: {
        id: string;
    };
} | {
    take: number;
    skip?: undefined;
    cursor?: undefined;
};
