/**
 * Rating Template Service
 * User-created rating templates for AURE
 * v0.38.14 - Template Marketplace
 */
export interface MetricDefinition {
    id: string;
    label: string;
    description?: string;
}
export interface RatingTemplate {
    id: string;
    userId: string;
    name: string;
    categoryLabel: string;
    metrics: MetricDefinition[];
    promptTemplate: string;
    icon?: string | null;
    isPublic: boolean;
    createdAt: Date;
    user?: {
        id: string;
        name: string | null;
    };
}
export interface CreateTemplateData {
    name: string;
    categoryLabel: string;
    metrics: MetricDefinition[];
    promptTemplate: string;
    icon?: string;
    isPublic: boolean;
}
/**
 * Create a new rating template
 */
export declare function createTemplate(userId: string, data: CreateTemplateData): Promise<RatingTemplate>;
/**
 * Get public templates
 */
export declare function getPublicTemplates(limit?: number): Promise<RatingTemplate[]>;
/**
 * Get user's own templates
 */
export declare function getOwnTemplates(userId: string): Promise<RatingTemplate[]>;
/**
 * Get template by ID
 */
export declare function getTemplate(templateId: string): Promise<RatingTemplate | null>;
