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
interface SubmitPackData {
    title: string;
    description?: string;
    type: 'POLL' | 'REFLECTION' | 'MISSION';
    metadata?: any;
}
interface SubmitPackResult {
    success: boolean;
    pack: {
        id: string;
        title: string;
        type: string;
        status: string;
        createdAt: string;
    };
    message: string;
}
export declare function useCreatorPacks(type?: 'POLL' | 'REFLECTION' | 'MISSION'): {
    packs: CreatorPack[];
    loading: boolean;
    error: string | null;
    total: number;
    reload: () => Promise<void>;
    submitPack: (data: SubmitPackData) => Promise<SubmitPackResult>;
};
export {};
