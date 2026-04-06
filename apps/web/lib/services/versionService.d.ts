export declare function getLatestVersion(): Promise<{
    id: string;
    value: string;
    name: string;
    createdAt: Date;
} | null>;
