/**
 * Pet Rating Preset
 * v0.38.5 - Category-Adaptive Rating Templates
 */
export declare const petPreset: {
    category: string;
    name: string;
    metrics: {
        id: string;
        label: string;
        description: string;
    }[];
    promptTemplate: string;
    adaptiveRules: {
        expressionQuality: string;
        visualClarity: string;
        poseQuality: string;
        uniquenessLevel: string;
        photoComposition: string;
    };
};
