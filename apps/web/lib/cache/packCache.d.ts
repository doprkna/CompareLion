export declare function getCached<T>(key: string): T | null;
export declare function setCached<T>(key: string, value: T, ttlMs?: number): void;
export declare function invalidate(keyPrefix: string): void;
