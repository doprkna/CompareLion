/**
 * Localization Configuration (v0.11.14)
 *
 * PLACEHOLDER: Multi-language support configuration.
 */
export declare const SUPPORTED_LOCALES: {
    readonly en: {
        readonly code: "en";
        readonly name: "English";
        readonly nativeName: "English";
        readonly flag: "🇬🇧";
    };
    readonly cs: {
        readonly code: "cs";
        readonly name: "Czech";
        readonly nativeName: "Čeština";
        readonly flag: "🇨🇿";
    };
    readonly de: {
        readonly code: "de";
        readonly name: "German";
        readonly nativeName: "Deutsch";
        readonly flag: "🇩🇪";
    };
    readonly fr: {
        readonly code: "fr";
        readonly name: "French";
        readonly nativeName: "Français";
        readonly flag: "🇫🇷";
    };
    readonly es: {
        readonly code: "es";
        readonly name: "Spanish";
        readonly nativeName: "Español";
        readonly flag: "🇪🇸";
    };
    readonly jp: {
        readonly code: "jp";
        readonly name: "Japanese";
        readonly nativeName: "日本語";
        readonly flag: "🇯🇵";
    };
};
export declare const DEFAULT_LOCALE = "en";
export type LocaleCode = keyof typeof SUPPORTED_LOCALES;
/**
 * Get user's preferred locale
 */
export declare function getUserLocale(_userId: string): Promise<string>;
/**
 * Set user's preferred locale
 */
export declare function setUserLocale(_userId: string, _locale: string): Promise<void>;
/**
 * Detect locale from browser headers
 */
export declare function detectLocaleFromHeaders(acceptLanguage?: string | null): string;
