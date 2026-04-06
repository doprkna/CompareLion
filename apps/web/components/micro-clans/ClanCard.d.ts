interface ClanCardProps {
    clan: {
        id: string;
        name: string;
        description?: string;
        leader: {
            id: string;
            name: string;
            image: string | null;
        };
        memberCount: number;
        buffType: 'xp' | 'gold' | 'karma' | 'compare' | 'reflect';
        buffValue: number;
        stats: {
            xpTotal: number;
            activityScore: number;
            rank: number;
            updatedAt: string;
        } | null;
        seasonId?: string;
        createdAt: string;
    };
    onClick?: (clanId: string) => void;
}
export declare function ClanCard({ clan, onClick }: ClanCardProps): import("react").JSX.Element;
export {};
