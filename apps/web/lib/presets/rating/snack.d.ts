/**
 * Snack Rating Preset
 * v0.38.5 - Category-Adaptive Rating Templates
 */
export declare const snackPreset: {
    category: string;
    name: string;
    metrics: {
        id: string;
        label: string;
        description: string;
    }[];
    promptTemplate: string;
    adaptiveRules: {
        highCreativityHint: string;
        lowHealthHint: string;
        visualClarity: string;
        presentationQuality: string;
        homemadeVsStore: string;
    };
};
