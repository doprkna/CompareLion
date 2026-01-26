export type Region = 'us' | 'eu' | 'asia' | 'latam';
export declare const REGIONS: Record<Region, {
    label: string;
    timezone: string;
}>;
export declare const DEFAULT_REGION: Region;
