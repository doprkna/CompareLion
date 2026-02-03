export declare function getItem(key: string): Promise<string | null>;
export declare function setItem(key: string, value: string): Promise<void>;
export declare function removeItem(key: string): Promise<void>;
export declare function getJSON<T>(key: string): Promise<T | null>;
export declare function setJSON(key: string, value: unknown): Promise<void>;
