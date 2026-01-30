export interface GroupListItem {
    id: string;
    name: string;
    description?: string | null;
    visibility: 'private' | 'public';
    transparency: 'summary' | 'full' | 'hidden';
    role: string;
    createdAt: string;
}
export declare function useGroups(): {
    groups: GroupListItem[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export interface GroupDetails {
    id: string;
    name: string;
    description?: string | null;
    visibility: 'private' | 'public';
    transparency: 'summary' | 'full' | 'hidden';
    memberCount: number;
    owner: {
        id: string;
        name: string | null;
        username: string | null;
    } | null;
    createdAt: string;
}
export declare function useGroup(groupId: string | null): {
    group: GroupDetails | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export interface GroupStats {
    totalXP: number;
    reflections: number;
    avgLevel: number;
    memberCount: number;
    transparency: 'summary' | 'full' | 'hidden';
    visibility: 'private' | 'public';
    isMember: boolean;
}
export declare function useGroupStats(groupId: string | null): {
    stats: GroupStats | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export interface GroupReflectionItem {
    id?: string;
    userId?: string;
    content?: string | null;
    summary?: string | null;
    sentiment?: string | null;
    createdAt?: string;
    user?: {
        id: string;
        name: string | null;
        username: string | null;
    };
    count?: number;
}
export declare function useGroupReflections(groupId: string | null): {
    data: GroupReflectionItem[] | {
        count: number;
    } | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
