interface DailyForkCardProps {
    fork: {
        id: string;
        key: string;
        title: string;
        description?: string;
        optionA: string;
        optionB: string;
        rarity?: string;
        createdAt: string;
    };
    userChoice?: {
        choice: 'A' | 'B';
        resultSummary?: string;
        createdAt: string;
    } | null;
    onChoose: (forkId: string, choice: 'A' | 'B') => Promise<void>;
    choosing?: boolean;
}
export declare function DailyForkCard({ fork, userChoice, onChoose, choosing }: DailyForkCardProps): import("react").JSX.Element;
export {};
