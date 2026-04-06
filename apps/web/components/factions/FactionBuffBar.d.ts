interface FactionBuffBarProps {
    userFaction: {
        factionId: string;
        contributedXP: number;
        isLeader?: boolean;
        faction: {
            name: string;
            colorPrimary: string;
            buffType?: string;
            buffValue?: number;
        };
    };
    rank?: number;
    totalMembers?: number;
}
export declare function FactionBuffBar({ userFaction, rank, totalMembers }: FactionBuffBarProps): import("react").JSX.Element;
export {};
