/**
 * Story Template Service
 * Handles story template CRUD and application
 * v0.40.9 - Story Templates Marketplace 1.0 (User-Created Story Presets)
 */
export interface StoryTemplateData {
    name: string;
    description: string;
    panelCount: number;
    layoutMode: 'vertical' | 'grid';
    panelLabels: string[];
    panelHelpTexts?: string[];
    isPublic: boolean;
}
export interface StoryTemplate {
    id: string;
    userId: string;
    name: string;
    description: string;
    panelCount: number;
    layoutMode: 'vertical' | 'grid';
    panelLabels: string[];
    panelHelpTexts: string[];
    isPublic: boolean;
    createdAt: Date;
}
/**
 * Create story template
 */
export declare function createStoryTemplate(userId: string, data: StoryTemplateData): Promise<StoryTemplate>;
/**
 * Get user's templates
 */
export declare function getUserTemplates(userId: string): Promise<StoryTemplate[]>;
/**
 * Get public templates
 */
export declare function getPublicTemplates(): Promise<StoryTemplate[]>;
/**
 * Get template by ID
 */
export declare function getTemplateById(templateId: string): Promise<StoryTemplate | null>;
/**
 * Apply template to story input (structural only, no AI)
 * Returns template metadata for UI to use
 */
export declare function applyTemplateToStoryInput(template: StoryTemplate): {
    panelCount: number;
    layoutMode: 'vertical' | 'grid';
    panelLabels: string[];
    panelHelpTexts: string[];
};
