/**
 * Changelog Configuration & Integrity Rules
 *
 * Protects historical changelog entries from modification:
 * - Prevents duplicate versions
 * - Enforces chronological order
 * - Locks historical entries
 * - Validates version format
 */
export declare const CHANGELOG_RULES: {
    HEADER_REGEX: RegExp;
    LOCK_COMMENT: string;
    ENFORCE_LOCK: boolean;
    PROTECT_OLDER_THAN_DAYS: number;
    MAX_VERSIONS: number;
    ALLOWED_SECTIONS: string[];
};
/**
 * Validate changelog integrity
 * Checks for duplicates, ordering, and format issues
 */
export declare function validateChangelogIntegrity(content: string): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Extract version numbers from changelog
 */
export declare function extractVersions(content: string): string[];
/**
 * Check if a version entry is protected (older than threshold)
 */
export declare function isVersionProtected(versionDate: string): boolean;
