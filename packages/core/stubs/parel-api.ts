/**
 * Build-time stub for @parel/api so packages/core can compile without
 * pulling in packages/api source (avoids TS6059/TS6307).
 * At runtime, apps/web resolves @parel/api to the real package.
 */

export interface ApiClientResponse<T = unknown> {
  data: T;
  meta?: { timestamp: string; requestId: string; version: string };
  pagination?: { page: number; pageSize: number; total: number; hasMore: boolean };
  response: Response;
}

export class ApiClientError extends Error {
  code: string;
  status: number;
  requestId?: string;
  details?: unknown;
  originalError?: Error;
  constructor(
    message: string,
    code: string,
    status: number,
    options?: { requestId?: string; details?: unknown; originalError?: Error }
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    if (options) {
      this.requestId = options.requestId;
      this.details = options.details;
      this.originalError = options.originalError;
    }
  }
}

const stubClient = {
  get<T = unknown>(_path: string, _options?: unknown): Promise<ApiClientResponse<T>> {
    return Promise.resolve({ data: undefined as T, response: new Response() });
  },
  post<T = unknown>(_path: string, _body?: unknown, _options?: unknown): Promise<ApiClientResponse<T>> {
    return Promise.resolve({ data: undefined as T, response: new Response() });
  },
  put<T = unknown>(_path: string, _body?: unknown, _options?: unknown): Promise<ApiClientResponse<T>> {
    return Promise.resolve({ data: undefined as T, response: new Response() });
  },
  patch<T = unknown>(_path: string, _body?: unknown, _options?: unknown): Promise<ApiClientResponse<T>> {
    return Promise.resolve({ data: undefined as T, response: new Response() });
  },
  delete<T = unknown>(_path: string, _options?: unknown): Promise<ApiClientResponse<T>> {
    return Promise.resolve({ data: undefined as T, response: new Response() });
  },
};

export const defaultClient = stubClient;
