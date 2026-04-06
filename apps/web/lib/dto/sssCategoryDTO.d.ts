export declare function toSssCategoryDTO(sssc: any): {
    id: string;
    label: string;
    status: string;
    sizeTag: string | null;
    lastRun: Date | null;
    version: number;
};
export type SssCategoryDTO = ReturnType<typeof toSssCategoryDTO>;
