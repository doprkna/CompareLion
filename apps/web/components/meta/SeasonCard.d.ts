interface SeasonCardProps {
    season: any;
    userProgress: {
        seasonLevel: number;
        seasonXP: number;
        prestigeCount: number;
    };
}
export declare function SeasonCard({ season, userProgress }: SeasonCardProps): import("react").JSX.Element;
export {};
