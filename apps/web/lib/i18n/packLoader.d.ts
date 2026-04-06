type Pack = Record<string, any> & {
    meta?: {
        version?: string;
        updatedAt?: string;
    };
};
export declare function loadPack(lang: string): Promise<{
    pack: Pack;
    etag: string;
}>;
export declare function getCachedPack(lang: string): {
    pack: Pack;
    etag: string;
} | null;
export {};
