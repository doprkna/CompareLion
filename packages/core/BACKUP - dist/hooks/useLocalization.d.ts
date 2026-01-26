export interface LocalizationState {
    lang: string;
    region: string;
}
/**
 * Hook for managing user localization preferences
 */
export declare function useLocalization(): {
    lang: any;
    region: any;
    setLang: (lang: string) => void;
    setRegion: (region: string) => void;
    setLocalization: (lang: string, region: string) => void;
    getQueryParams: () => URLSearchParams;
    isClient: any;
};
/**
 * Helper to build API URL with localization params
 */
export declare function withLocalization(baseUrl: string, lang: string, region: string): string;
