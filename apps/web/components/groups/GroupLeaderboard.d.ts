interface Props {
    stats: {
        totalXP: number;
        reflections: number;
        avgLevel: number;
        memberCount: number;
    } | null;
}
export declare function GroupLeaderboard({ stats }: Props): import("react").JSX.Element | null;
export {};
