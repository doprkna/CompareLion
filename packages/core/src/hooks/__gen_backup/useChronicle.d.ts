import type { Chronicle } from '../state/stores/chronicleStore';
export type { Chronicle };
export declare function useChronicle(type?: 'weekly' | 'seasonal'): {
    chronicle: any;
    loading: any;
    error: any;
    reload: () => any;
};
export declare function useGenerateChronicle(): {
    generateChronicle: (type: "weekly" | "seasonal", seasonId?: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
