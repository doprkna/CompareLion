/**
 * Changelog Configuration & Integrity Rules
 * 
 * Protects historical changelog entries from modification:
 * - Prevents duplicate versions
 * - Enforces chronological order
 * - Locks historical entries
 * - Validates version format
 */

export const CHANGELOG_RULES = {
  // Regex for matching version headers like "## [0.5.4] - 2025-10-08"
  HEADER_REGEX: /^## \[(\d+\.\d+\.\d+[a-z]?)\] - (\d{4}-\d{2}-\d{2})$/m,
  
  // Lock comment to indicate changelog is protected
  LOCK_COMMENT: "<!-- version-lock: true -->",
  
  // Enforce lock checks (set false for emergency edits only)
  ENFORCE_LOCK: true,
  
  // Freeze entries older than this many days
  PROTECT_OLDER_THAN_DAYS: 1,
  
  // Maximum allowed versions in changelog
  MAX_VERSIONS: 100,
  
  // Allowed section names
  ALLOWED_SECTIONS: ['Added', 'Changed', 'Fixed', 'Deprecated', 'Removed', 'Security'],
};

/**
 * Validate changelog integrity
 * Checks for duplicates, ordering, and format issues
 */
export function validateChangelogIntegrity(content: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for lock comment if enforcement is enabled
  if (CHANGELOG_RULES.ENFORCE_LOCK && !content.includes(CHANGELOG_RULES.LOCK_COMMENT)) {
    warnings.push('Changelog missing version-lock comment');
  }
  
  // Extract all version headers
  const lines = content.split('\n');
  const versions: Array<{ version: string; date: string; lineNumber: number }> = [];
  
  lines.forEach((line, index) => {
    const match = line.match(CHANGELOG_RULES.HEADER_REGEX);
    if (match) {
      versions.push({
        version: match[1],
        date: match[2],
        lineNumber: index + 1,
      });
    }
  });
  
  // Check for duplicates
  const seen = new Set<string>();
  for (const v of versions) {
    if (seen.has(v.version)) {
      errors.push(`Duplicate version detected: ${v.version} (line ${v.lineNumber})`);
    }
    seen.add(v.version);
  }
  
  // Check chronological order (newest first)
  for (let i = 0; i < versions.length - 1; i++) {
    const current = new Date(versions[i].date);
    const next = new Date(versions[i + 1].date);
    
    if (current < next) {
      warnings.push(
        `Version ${versions[i].version} (${versions[i].date}) is older than ` +
        `${versions[i + 1].version} (${versions[i + 1].date}) but appears before it`
      );
    }
  }
  
  // Check version number order (should be descending)
  for (let i = 0; i < versions.length - 1; i++) {
    const currentVer = parseVersion(versions[i].version);
    const nextVer = parseVersion(versions[i + 1].version);
    
    if (compareVersions(currentVer, nextVer) < 0) {
      warnings.push(
        `Version ${versions[i].version} is lower than ${versions[i + 1].version} but appears before it`
      );
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Parse semantic version string
 */
function parseVersion(version: string): { major: number; minor: number; patch: number; suffix: string } {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)([a-z]?)$/);
  if (!match) {
    return { major: 0, minor: 0, patch: 0, suffix: '' };
  }
  
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    suffix: match[4] || '',
  };
}

/**
 * Compare two semantic versions
 * Returns: 1 if a > b, -1 if a < b, 0 if equal
 */
function compareVersions(
  a: { major: number; minor: number; patch: number; suffix: string },
  b: { major: number; minor: number; patch: number; suffix: string }
): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  
  // Handle suffixes (a, b, c)
  if (a.suffix !== b.suffix) {
    if (!a.suffix) return 1; // No suffix is newer than with suffix
    if (!b.suffix) return -1;
    return a.suffix.localeCompare(b.suffix);
  }
  
  return 0;
}

/**
 * Extract version numbers from changelog
 */
export function extractVersions(content: string): string[] {
  const lines = content.split('\n');
  const versions: string[] = [];
  
  for (const line of lines) {
    const match = line.match(CHANGELOG_RULES.HEADER_REGEX);
    if (match) {
      versions.push(match[1]);
    }
  }
  
  return versions;
}

/**
 * Check if a version entry is protected (older than threshold)
 */
export function isVersionProtected(versionDate: string): boolean {
  const date = new Date(versionDate);
  const now = new Date();
  const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysDiff > CHANGELOG_RULES.PROTECT_OLDER_THAN_DAYS;
}

