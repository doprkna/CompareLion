export type SssCategoryDTO = {
    id: number;
    label: string;
    status: string;
    sizeTag: string;
    lastRun: string | null;
    version: string;
};
export declare function toSssCategoryDTO(s: any): SssCategoryDTO;
