/**
 * Outfit Rating Preset
 * v0.38.5 - Category-Adaptive Rating Templates
 */
export declare const outfitPreset: {
    category: string;
    name: string;
    metrics: {
        id: string;
        label: string;
        description: string;
    }[];
    promptTemplate: string;
    adaptiveRules: {
        colorCoordination: string;
        styleConsistency: string;
        visualClarity: string;
        uniquenessLevel: string;
        occasionAppropriate: string;
    };
};
