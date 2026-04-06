export declare function getUserFromRequest(request: Request): Promise<{
    userId: string;
    email: string;
} | null>;
/**
 * API Response Helpers (v0.35.16d - Build safety exports)
 */
export declare const successResponse: (data: any) => Response;
export declare const unauthorizedError: (msg?: string) => Response;
export declare const validationError: (msg?: string) => Response;
