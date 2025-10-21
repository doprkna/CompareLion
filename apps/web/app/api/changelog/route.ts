import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { CHANGELOG_RULES, validateChangelogIntegrity } from '@/lib/changelogConfig';

interface ChangelogEntry {
  version: string;
  date: string;
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
      } else if (line.startsWith("- ") && current) {
        sections[current].push(line.substring(2));
      } else if (/^\s+- /.test(line) && current && sections[current].length > 0) {
        // nested bullet
        const last = sections[current].pop() || "";
        sections[current].push(last + "\n  " + line.trim().substring(2));
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

export async function GET() {
  try {
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
          console.log(`Changelog loaded from: ${changelogPath}`);
          break;
        }
      } catch (err) {
        // Continue to next path
      }
    }
    
    if (!found) {
      console.error('Changelog file not found in any of:', possiblePaths);
      return NextResponse.json({ 
        success: false, 
        entries: [],
        error: 'Changelog file not found'
      }, { status: 404 });
    }
    
    // Debug logging
    console.log("🪶 CHANGELOG RAW LENGTH:", content.length);
    console.log("🪶 SAMPLE:", content.slice(0, 500));
    
    // 🧠 Changelog integrity validation
    if (CHANGELOG_RULES.ENFORCE_LOCK && content.includes(CHANGELOG_RULES.LOCK_COMMENT)) {
      const integrity = validateChangelogIntegrity(content);
      
      // Log warnings
      if (integrity.warnings.length > 0) {
        console.warn('⚠️  Changelog warnings:');
        integrity.warnings.forEach(w => console.warn(`   - ${w}`));
      }
      
      // Return error if integrity check fails
      if (!integrity.valid) {
        console.error('❌ Changelog integrity check failed:');
        integrity.errors.forEach(e => console.error(`   - ${e}`));
        
        return NextResponse.json({
          success: false,
          entries: [],
          error: 'Changelog integrity check failed',
          details: integrity.errors,
        }, { status: 400 });
      }
      
      console.log('✅ Changelog integrity check passed');
    }
    
    const entries = parseChangelog(content);
    
    console.log("🪶 PARSED BLOCKS:", entries.map(e => e.version));
    
    const response = NextResponse.json({ 
      success: true, 
      entries
    });
    
    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error parsing changelog:', error);
    return NextResponse.json({ 
      success: false, 
      entries: [],
      error: error instanceof Error ? error.message : 'Failed to parse changelog'
    }, { status: 500 });
  }
}
