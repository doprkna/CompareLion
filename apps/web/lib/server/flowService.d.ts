import 'server-only';
export declare function getUserProgressStats(categoryId: string): Promise<{
    answered: number;
    skipped: number;
    total: number;
}>;
