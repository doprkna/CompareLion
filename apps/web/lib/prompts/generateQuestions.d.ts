export declare function buildPrompt(ctx: {
    names: string[];
    locale?: string;
    targetCount: number;
}): {
    system: string;
    user: string;
};
