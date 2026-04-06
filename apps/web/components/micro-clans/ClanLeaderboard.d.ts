interface ClanLeaderboardProps {
    clans: Array<{
        id: string;
        name: string;
        leader: {
            id: string;
            name: string;
            image: string | null;
        };
        memberCount: number;
        buffType: string;
        stats: {
            xpTotal: number;
            activityScore: number;
            rank: number;
            updatedAt: string;
        } | null;
    }>;
    limit?: number;
}
export declare function ClanLeaderboard({ clans, limit }: ClanLeaderboardProps): import("react").JSX.Element;
export {};
