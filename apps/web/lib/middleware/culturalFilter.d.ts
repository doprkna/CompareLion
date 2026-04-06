type Severity = 'info' | 'warn' | 'block';
export interface CulturalFilter {
    id: string;
    region: string;
    tag: string;
    category: string | null;
    description: string | null;
    severity: Severity;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface EvaluationInput {
    region: string | null | undefined;
    tags: string[];
}
export interface EvaluationResult {
    action: 'none' | 'info' | 'warn' | 'block';
    matched: CulturalFilter[];
}
export declare function invalidateFilters(region: string): Promise<void>;
export declare function loadActiveFilters(regionInput?: string | null): Promise<CulturalFilter[]>;
export declare function evaluateContent(input: EvaluationInput): Promise<EvaluationResult>;
export {};
