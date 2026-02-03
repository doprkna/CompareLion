export declare const REGIONS: readonly ["EU", "US", "JP", "KR", "CN"];
export type Region = (typeof REGIONS)[number];
export declare const DEFAULT_REGION: Region;
export declare const REGION_SETTINGS: Record<Region, {
    locale: string;
    theme: string;
}>;
