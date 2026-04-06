interface GenerationCardProps {
    generation: {
        id: string;
        generationNumber: number;
        inheritedPerks: Array<{
            type: string;
            value: string | number;
            fromGeneration?: number;
        }>;
        summaryText?: string | null;
        createdAt: string;
    };
}
export declare function GenerationCard({ generation }: GenerationCardProps): import("react").JSX.Element;
export {};
