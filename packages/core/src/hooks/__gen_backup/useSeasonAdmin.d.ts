interface SeasonAction {
    action: 'start' | 'end' | 'update';
    seasonId?: string;
    key?: string;
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    xpBonus?: number;
    goldBonus?: number;
}
interface SeasonActionResult {
    success: boolean;
    message: string;
    season?: {
        id: string;
        key: string;
        title: string;
        startDate: string;
        endDate?: string | null;
    };
}
export declare function useSeasonAdmin(): {
    performAction: (actionData: SeasonAction) => Promise<SeasonActionResult>;
    startSeason: (data: {
        key?: string;
        title?: string;
        description?: string;
        startDate?: string;
        endDate?: string;
    }) => Promise<SeasonActionResult>;
    endSeason: (seasonId: string, endDate?: string) => Promise<SeasonActionResult>;
    updateSeason: (seasonId: string, data: {
        title?: string;
        description?: string;
        startDate?: string;
        endDate?: string;
    }) => Promise<SeasonActionResult>;
    loading: boolean;
    error: string | null;
};
export {};
