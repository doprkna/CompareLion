/**
 * Cursor-based pagination utilities
 */
/**
 * Parse pagination parameters from query string
 */
export function parsePaginationParams(searchParams, options = {}) {
    const { maxLimit = 100, defaultLimit = 20, } = options;
    const limit = Math.min(parseInt(searchParams.get('limit') || defaultLimit.toString()), maxLimit);
    const cursor = searchParams.get('cursor') || undefined;
    return {
        limit,
        cursor,
    };
}
/**
 * Create cursor from a record (typically using createdAt + id)
 */
export function createCursor(record) {
    const timestamp = record.createdAt.getTime();
    const encoded = Buffer.from(`${timestamp}-${record.id}`).toString('base64');
    return encoded;
}
/**
 * Parse cursor to extract timestamp and id
 */
export function parseCursor(cursor) {
    try {
        const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
        const [timestamp, id] = decoded.split('-');
        return {
            timestamp: parseInt(timestamp),
            id,
        };
    }
    catch {
        return null;
    }
}
/**
 * Build Prisma where clause for cursor-based pagination
 */
export function buildCursorWhere(cursor, dateField = 'createdAt') {
    if (!cursor) {
        return {};
    }
    const parsed = parseCursor(cursor);
    if (!parsed) {
        return {};
    }
    return {
        OR: [
            {
                [dateField]: {
                    lt: new Date(parsed.timestamp),
                },
            },
            {
                [dateField]: new Date(parsed.timestamp),
                id: {
                    lt: parsed.id,
                },
            },
        ],
    };
}
/**
 * Build Prisma orderBy clause for cursor-based pagination
 */
export function buildCursorOrderBy(dateField = 'createdAt') {
    return [
        { [dateField]: 'desc' },
        { id: 'desc' },
    ];
}
/**
 * Process pagination results and create next cursor
 */
export function processPaginationResults(items, limit) {
    const hasMore = items.length > limit;
    const actualItems = hasMore ? items.slice(0, limit) : items;
    let nextCursor;
    if (hasMore && actualItems.length > 0) {
        const lastItem = actualItems[actualItems.length - 1];
        nextCursor = createCursor(lastItem);
    }
    return {
        items: actualItems,
        nextCursor,
        hasMore,
    };
}
/**
 * Generic cursor-based pagination function for Prisma queries
 */
export async function paginateQuery(query, params, options = {}) {
    const { defaultLimit = 20, maxLimit = 100 } = options;
    const limit = Math.min(params.limit || defaultLimit, maxLimit);
    // Fetch one extra item to determine if there are more
    const items = await query();
    return processPaginationResults(items, limit + 1);
}
/**
 * Build pagination response headers
 */
export function buildPaginationHeaders(result) {
    const headers = {
        'X-Total-Count': result.total?.toString() || '',
        'X-Has-More': result.hasMore.toString(),
    };
    if (result.nextCursor) {
        headers['X-Next-Cursor'] = result.nextCursor;
    }
    return headers;
}
export function parseOffsetPaginationParams(searchParams, options = {}) {
    const { maxLimit = 100, defaultLimit = 20, } = options;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(parseInt(searchParams.get('limit') || defaultLimit.toString()), maxLimit);
    return { page, limit };
}
export function processOffsetResults(items, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    return {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}
