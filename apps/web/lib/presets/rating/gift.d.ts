/**
 * Gift Rating Preset
 * v0.38.5 - Category-Adaptive Rating Templates
 */
export declare const giftPreset: {
    category: string;
    name: string;
    metrics: {
        id: string;
        label: string;
        description: string;
    }[];
    promptTemplate: string;
    adaptiveRules: {
        presentationQuality: string;
        personalizationLevel: string;
        visualClarity: string;
        uniquenessLevel: string;
        appropriateness: string;
    };
};
