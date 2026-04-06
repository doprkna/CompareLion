interface MirrorEventCardProps {
    event: {
        id: string;
        key: string;
        title: string;
        description: string;
        theme?: string;
        startDate: string;
        endDate: string;
        questionSet: string[];
        rewardXP: number;
        rewardBadgeId?: string;
        timeRemaining: number;
        daysRemaining: number;
        globalMood: string;
    };
}
export declare function MirrorEventCard({ event }: MirrorEventCardProps): import("react").JSX.Element;
export {};
