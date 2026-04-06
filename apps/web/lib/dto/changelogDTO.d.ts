export declare function toChangelogDTO(c: any): {
    id: string;
    version: string;
    changes: {
        type: string;
        text: string;
    }[];
    releasedAt: Date;
};
export type ChangelogDTO = ReturnType<typeof toChangelogDTO>;
