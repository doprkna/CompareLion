/**
 * Rating Presets Index
 * Exports all category presets
 * v0.38.5 - Category-Adaptive Rating Templates
 */
import { snackPreset } from './snack';
export declare const PRESETS: {
    snack: {
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
    outfit: {
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
    car: {
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
    room: {
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
    gift: {
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
    pet: {
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
};
export type CategoryPreset = typeof snackPreset;
