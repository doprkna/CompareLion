/**
 * Translation Manager (v0.11.14)
 *
 * PLACEHOLDER: Manage translation keys and fallbacks.
 */
/**
 * Get translation for key
 */
export declare function getTranslation(key: string, _locale?: string): Promise<string>;
/**
 * Get all translations for namespace
 */
export declare function getNamespaceTranslations(_namespace: string, _locale: string): Promise<{}>;
/**
 * Set translation for key
 */
export declare function setTranslation(_key: string, _locale: string, _value: string): Promise<void>;
/**
 * Get missing translation keys
 */
export declare function getMissingKeys(): Promise<never[]>;
/**
 * Export translations to JSON
 */
export declare function exportTranslations(_locale: string): Promise<{}>;
/**
 * Import translations from JSON
 */
export declare function importTranslations(_locale: string, _data: Record<string, Record<string, string>>): Promise<void>;
