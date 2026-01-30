/**
 * Build-time stub for @parel/api so packages/core can compile without
 * pulling in packages/api source (avoids TS6059/TS6307).
 * At runtime, apps/web resolves @parel/api to the real package.
 */
export interface ApiClientResponse<T = unknown> {
    data: T;
    meta?: {
        timestamp: string;
        requestId: string;
        version: string;
    };
    pagination?: {
        page: number;
        pageSize: number;
        total: number;
        hasMore: boolean;
    };
    response: Response;
}
export declare class ApiClientError extends Error {
    code: string;
    status: number;
    requestId?: string;
    details?: unknown;
    originalError?: Error;
    constructor(message: string, code: string, status: number, options?: {
        requestId?: string;
        details?: unknown;
        originalError?: Error;
    });
}
export declare const defaultClient: {
    get<T = unknown>(_path: string, _options?: unknown): Promise<ApiClientResponse<T>>;
    post<T = unknown>(_path: string, _body?: unknown, _options?: unknown): Promise<ApiClientResponse<T>>;
    put<T = unknown>(_path: string, _body?: unknown, _options?: unknown): Promise<ApiClientResponse<T>>;
    patch<T = unknown>(_path: string, _body?: unknown, _options?: unknown): Promise<ApiClientResponse<T>>;
    delete<T = unknown>(_path: string, _options?: unknown): Promise<ApiClientResponse<T>>;
};
