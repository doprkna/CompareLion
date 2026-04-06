interface FactionInfluenceMapProps {
    map: Record<string, {
        region: string;
        topFaction: {
            factionId: string;
            name: string;
            key: string;
            colorPrimary: string;
            colorSecondary?: string;
            influenceScore: number;
        };
        allFactions: Array<{
            name: string;
            influence: number;
            contributions: number;
        }>;
    }>;
}
export declare function FactionInfluenceMap({ map }: FactionInfluenceMapProps): import("react").JSX.Element;
export {};
