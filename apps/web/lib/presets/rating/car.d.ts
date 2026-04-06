/**
 * Car Rating Preset
 * v0.38.5 - Category-Adaptive Rating Templates
 */
export declare const carPreset: {
    category: string;
    name: string;
    metrics: {
        id: string;
        label: string;
        description: string;
    }[];
    promptTemplate: string;
    adaptiveRules: {
        conditionQuality: string;
        visualClarity: string;
        uniquenessLevel: string;
        presentationQuality: string;
        eraAppropriate: string;
    };
};
