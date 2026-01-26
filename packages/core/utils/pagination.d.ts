/**
 * Cursor-based pagination utilities
 */
export interface PaginationParams {
    limit?: number;
    cursor?: string;
}
export interface PaginationResult<T> {
    items: T[];
    nextCursor?: string;
    hasMore: boolean;
    total?: number;
}
export interface CursorPaginationOptions {
    limit?: number;
    maxLimit?: number;
    defaultLimit?: number;
}
/**
 * Parse pagination parameters from query string
 */
export declare function parsePaginationParams(searchParams: URLSearchParams, options?: CursorPaginationOptions): PaginationParams;
/**
 * Create cursor from a record (typically using createdAt + id)
 */
export declare function createCursor(record: {
    id: string;
    createdAt: Date;
}): string;
/**
 * Parse cursor to extract timestamp and id
 */
export declare function parseCursor(cursor: string): {
    timestamp: number;
    id: string;
} | null;
/**
 * Build Prisma where clause for cursor-based pagination
 */
export declare function buildCursorWhere(cursor?: string, dateField?: string): {
    OR?: undefined;
} | {
    OR: ({
        [dateField]: {
            lt: Date;
        };
        id?: undefined;
    } | {
        [dateField]: Date;
        id: {
            lt: string;
        };
    })[];
};
/**
 * Build Prisma orderBy clause for cursor-based pagination
 */
export declare function buildCursorOrderBy(dateField?: string): ({
    [dateField]: "desc";
    id?: undefined;
} | {
    id: "desc";
})[];
/**
 * Process pagination results and create next cursor
 */
export declare function processPaginationResults<T extends {
    id: string;
    createdAt: Date;
}>(items: T[], limit: number): PaginationResult<T>;
/**
 * Generic cursor-based pagination function for Prisma queries
 */
export declare function paginateQuery<T extends {
    id: string;
    createdAt: Date;
}>(query: () => Promise<T[]>, params: PaginationParams, options?: CursorPaginationOptions): Promise<PaginationResult<T>>;
/**
 * Build pagination response headers
 */
export declare function buildPaginationHeaders(result: PaginationResult<any>): Record<string, string>;
/**
 * Offset-based pagination (fallback for simple cases)
 */
export interface OffsetPaginationParams {
    page?: number;
    limit?: number;
}
export interface OffsetPaginationResult<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export declare function parseOffsetPaginationParams(searchParams: URLSearchParams, options?: CursorPaginationOptions): OffsetPaginationParams;
export declare function processOffsetResults<T>(items: T[], total: number, page: number, limit: number): OffsetPaginationResult<T>;
