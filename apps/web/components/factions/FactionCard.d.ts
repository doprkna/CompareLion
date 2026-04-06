interface FactionCardProps {
    faction: {
        id: string;
        key: string;
        name: string;
        motto?: string;
        description?: string;
        colorPrimary: string;
        colorSecondary?: string;
        buffType?: string;
        buffValue?: number;
        influence: number;
        membersCount: number;
    };
    userFaction?: any;
    onJoin?: (factionId: string) => void;
    joining?: boolean;
}
export declare function FactionCard({ faction, userFaction, onJoin, joining }: FactionCardProps): import("react").JSX.Element;
export {};
