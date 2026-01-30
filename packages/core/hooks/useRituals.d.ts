import type { Ritual, RitualUserProgress } from '../state/stores/ritualsStore';
export type { Ritual, RitualUserProgress };
export declare function useRituals(): {
    ritual: any;
    userProgress: any;
    loading: any;
    error: any;
    reload: any;
};
export declare function useCompleteRitual(): {
    complete: (ritualId: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
