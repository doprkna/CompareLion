/**
 * Room / Desk Setup Rating Preset
 * v0.38.5 - Category-Adaptive Rating Templates
 */
export declare const roomPreset: {
    category: string;
    name: string;
    metrics: {
        id: string;
        label: string;
        description: string;
    }[];
    promptTemplate: string;
    adaptiveRules: {
        clutterLevel: string;
        lightingQuality: string;
        visualClarity: string;
        designCoherence: string;
        functionality: string;
    };
};
