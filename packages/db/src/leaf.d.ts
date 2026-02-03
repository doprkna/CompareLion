export type LeafContext = {
    ssscId: string;
    names: string[];
    ids: {
        categoryId: string;
        subCategoryId?: string;
        subSubCategoryId?: string;
        ssscId: string;
    };
    locale?: string;
    difficultyHint?: string;
};
export declare function getLeafContext(ssscId: string): Promise<LeafContext>;
