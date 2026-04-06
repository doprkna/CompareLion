export interface AIContextDTO {
    region: string;
    localeCode: string;
    toneProfile?: string | null;
    culturalNotes?: string | null;
    humorStyle?: string | null;
    tabooTopics?: string[] | null;
}
export declare function invalidateAIContext(region: string): Promise<void>;
export declare function getAIContext(localeOrRegion?: string | null): Promise<AIContextDTO>;
export declare function validateAIContextInput(input: Partial<AIContextDTO>): {
    valid: boolean;
    errors: string[];
};
