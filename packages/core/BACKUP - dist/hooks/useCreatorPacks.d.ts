export interface CreatorPack {
    id: string;
    creatorId: string;
    creator?: {
        id: string;
        username: string | null;
        name: string | null;
        avatarUrl?: string | null;
    } | null;
    title: string;
    description?: string | null;
    type: 'POLL' | 'REFLECTION' | 'MISSION';
    status: 'DRAFT' | 'APPROVED' | 'REJECTED';
    metadata?: any;
    createdAt: string;
    approvedAt?: string | null;
    approvedBy?: string | null;
}
export declare function useCreatorPacks(type?: 'POLL' | 'REFLECTION' | 'MISSION'): {
    packs: any;
    loading: any;
    error: any;
    total: any;
    reload: any;
    submitPack: any;
};
