interface ChronicleStatsProps {
    stats: {
        reflectionCount: number;
        xpGained: number;
        dominantSentiment: string;
        sentimentCounts: Record<string, number>;
        mostActiveDay?: string;
    };
}
export declare function ChronicleStats({ stats }: ChronicleStatsProps): import("react").JSX.Element;
export {};
