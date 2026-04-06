import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { CHANGELOG_RULES, validateChangelogIntegrity } from '@/lib/changelogConfig';
import { safeAsync } from '@/lib/api-handler';

interface ChangelogEntry {
  version: string;
  date: string;
  month?: string;
  year?: number;
  counts?: { added: number; fixed: number; changed: number; docs: number };
  sections: Record<string, string[]>;
}

/**
 * Parse CHANGELOG.md and return structured entries
 * - Handles nested bullets properly
 * - Filters out "Unreleased" in production
 * - Returns newest entries first
 */
function parseChangelog(md: string): ChangelogEntry[] {
  // Split by ## [ to get version blocks
  const blocks = md.split(/^##\s+\[/gm).slice(1);
  
  const entries = blocks.map(block => {
    const [headerLine, ...rest] = block.split("\n");
    const [versionPart, datePart] = headerLine.split("] - ");
    const version = versionPart.replace(/[\[\]]/g, "").trim();
    const date = datePart ? datePart.trim() : "";
    
    const body = rest.join("\n");
    const sections: Record<string, string[]> = {};
    let current: string | null = null;
    
    for (const line of body.split("\n")) {
      const h3 = line.match(/^###\s+(.*)/);
      if (h3) {
        current = h3[1].trim();
        sections[current] = [];
      } else if (current) {
        const bullet = line.match(/^\s*-\s+(.*)$/);
        if (bullet) {
          const text = bullet[1].trim();
          if (text) sections[current].push(text);
        }
      }
    }
    
    return { version, date, sections };
  }).filter(e => Object.keys(e.sections).length > 0);

  // Filter out "Unreleased" in production
  const showUnreleased = 
    process.env.NEXT_PUBLIC_SHOW_UNRELEASED === 'true' || 
    process.env.NODE_ENV !== 'production';

  const released = entries.filter(e => e.version.toLowerCase() !== 'unreleased');
  const unreleased = entries.filter(e => e.version.toLowerCase() === 'unreleased');

  // Sort released versions by date (newest first)
  released.sort((a, b) => {
    const dateA = new Date(a.date || '1970-01-01').getTime();
    const dateB = new Date(b.date || '1970-01-01').getTime();
    return dateB - dateA;
  });

  // Return released versions first (newest first), then unreleased if showing
  return [...released, ...(showUnreleased ? unreleased : [])];
}

export const GET = safeAsync(async (req: NextRequest) => {
  // Try multiple possible paths for the changelog file
  const possiblePaths = [
    path.join(process.cwd(), 'CHANGELOG.md'),
    path.join(process.cwd(), 'apps/web/CHANGELOG.md'),
    path.join(process.cwd(), '..', 'CHANGELOG.md'),
    path.join(process.cwd(), '..', '..', 'CHANGELOG.md')
  ];
  
  let content = '';
  let found = false;
  
  for (const changelogPath of possiblePaths) {
    try {
      if (fs.existsSync(changelogPath)) {
        content = fs.readFileSync(changelogPath, 'utf-8');
        found = true;
        break;
      }
    } catch (err) {
      // Continue to next path
    }
  }
  
  if (!found) {
    return NextResponse.json({ 
      success: false, 
      entries: [],
      error: 'Changelog file not found'
    }, { status: 404 });
  }
  
  // 🧠 Changelog integrity validation
  if (CHANGELOG_RULES.ENFORCE_LOCK && content.includes(CHANGELOG_RULES.LOCK_COMMENT)) {
    const integrity = validateChangelogIntegrity(content);
    
    // Return error if integrity check fails
    if (!integrity.valid) {
      return NextResponse.json({
        success: false,
        entries: [],
        error: 'Changelog integrity check failed',
        details: integrity.errors,
        warnings: integrity.warnings,
      }, { status: 400 });
    }
    
  }
  
  const rawEntries = parseChangelog(content);
  const entries = rawEntries.map((e) => {
    const date = e.date || '';
    const [y, m] = date.split('-');
    const year = parseInt(y, 10) || new Date().getFullYear();
    const monthNum = parseInt(m, 10) || 1;
    const month = date.length >= 7 ? date.slice(0, 7) : `${year}-${String(monthNum).padStart(2, '0')}`;
    const sections = e.sections || {};
    const getCount = (key: string) => {
      const k = Object.keys(sections).find((x) => x.toLowerCase() === key.toLowerCase());
      return k ? (sections[k]?.length || 0) : 0;
    };
    return {
      ...e,
      month: month || `${year}-${String(parseInt(m, 10) || 1).padStart(2, '0')}`,
      year,
      counts: {
        added: getCount('Added'),
        fixed: getCount('Fixed'),
        changed: getCount('Changed'),
        docs: getCount('Docs'),
      },
    };
  });

  const response = NextResponse.json({ 
    success: true, 
    entries
  });
  
  // Add cache-busting headers
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
});
