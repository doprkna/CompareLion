/**
 * Build-time stub for @parel/api so packages/core can compile without
 * pulling in packages/api source (avoids TS6059/TS6307).
 * At runtime, apps/web resolves @parel/api to the real package.
 */
export class ApiClientError extends Error {
    constructor(message, code, status, options) {
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
    get(_path, _options) {
        return Promise.resolve({ data: undefined, response: new Response() });
    },
    post(_path, _body, _options) {
        return Promise.resolve({ data: undefined, response: new Response() });
    },
    put(_path, _body, _options) {
        return Promise.resolve({ data: undefined, response: new Response() });
    },
    patch(_path, _body, _options) {
        return Promise.resolve({ data: undefined, response: new Response() });
    },
    delete(_path, _options) {
        return Promise.resolve({ data: undefined, response: new Response() });
    },
};
export const defaultClient = stubClient;
