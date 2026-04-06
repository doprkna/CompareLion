interface ClanBuffBadgeProps {
    buff: {
        type: 'xp' | 'gold' | 'karma' | 'compare' | 'reflect';
        value: number;
        clanName: string;
    } | null;
    compact?: boolean;
}
export declare function ClanBuffBadge({ buff, compact }: ClanBuffBadgeProps): import("react").JSX.Element | null;
export {};
