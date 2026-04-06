import { WildcardEvent } from '@parel/core/config';
export declare function resolveWildcard(date: Date, region?: string, lang?: string): WildcardEvent | null;
export declare function getWildcardForToday(region?: string, lang?: string): WildcardEvent | null;
export declare function preloadWildcardsNextDays(days?: number): void;
