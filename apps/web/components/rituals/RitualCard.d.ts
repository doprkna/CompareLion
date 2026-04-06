interface RitualCardProps {
    ritual: {
        id: string;
        key: string;
        title: string;
        description: string;
        rewardXP: number;
        rewardKarma: number;
        timeOfDay: 'morning' | 'evening' | 'any';
    };
    userProgress: {
        streakCount: number;
        totalCompleted: number;
        lastCompleted: string | null;
        completedToday: boolean;
    };
    onComplete: (ritualId: string) => Promise<void>;
    completing?: boolean;
}
export declare function RitualCard({ ritual, userProgress, onComplete, completing, }: RitualCardProps): import("react").JSX.Element;
export {};
