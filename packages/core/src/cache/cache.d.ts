export declare function cacheGet<T = any>(key: string): Promise<T | null>;
export declare function cacheSet(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
export declare function cacheDelete(key: string): Promise<boolean>;
