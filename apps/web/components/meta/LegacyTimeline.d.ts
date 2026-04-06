interface LegacyTimelineProps {
    legacy: {
        prestigeCount: number;
        totalLegacyXP: number;
        legacyPerk?: string;
        prestigeRecords: Array<{
            id: string;
            season: {
                id: string;
                key: string;
                title: string;
            };
            oldLevel: number;
            legacyXP: number;
            prestigeCount: number;
            badge?: {
                id: string;
                key: string;
                name: string;
                icon: string;
                rarity: string;
                description: string;
            } | null;
            createdAt: string;
        }>;
        pastSeasons: Array<{
            id: string;
            key: string;
            title: string;
            startDate: string;
            endDate?: string;
        }>;
    };
}
export declare function LegacyTimeline({ legacy }: LegacyTimelineProps): import("react").JSX.Element;
export {};
