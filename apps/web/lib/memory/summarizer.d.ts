type Inputs = {
    reflections: {
        content?: string | null;
        summary?: string | null;
        sentiment?: string | null;
        createdAt: string | Date;
    }[];
    stats: {
        totalXP: number;
        avgLevel: number;
        reflections: number;
        memberCount?: number;
    } | null;
    firesides: {
        count: number;
    };
    polls: {
        votes: number;
    };
    periodStart: Date;
    periodEnd: Date;
};
export declare function generateMemoryMarkdown(input: Inputs): {
    title: string;
    summary: string;
    content: string;
    sourceCount: number;
};
export {};
