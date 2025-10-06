import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface ChangelogEntry {
  version: string;
  date: string;
  added: Array<{ text: string; children: string[] }>;
  changed: Array<{ text: string; children: string[] }>;
  fixed: Array<{ text: string; children: string[] }>;
}

function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = content.split('\n');
  
  let currentEntry: ChangelogEntry | null = null;
  let currentSection: 'added' | 'changed' | 'fixed' | null = null;
  let currentItem: { text: string; children: string[] } | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Match version headers like "## [0.4.1] - 2025-10-06"
    const versionMatch = line.match(/^## \[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?/);
    if (versionMatch) {
      if (currentEntry) {
        entries.push(currentEntry);
      }
      currentEntry = {
        version: versionMatch[1],
        date: versionMatch[2] || '',
        added: [],
        changed: [],
        fixed: []
      };
      currentSection = null;
      currentItem = null;
      continue;
    }
    
    // Match section headers like "### Added", "### Changed", "### Fixed"
    const sectionMatch = line.match(/^### (Added|Changed|Fixed)$/i);
    if (sectionMatch && currentEntry) {
      currentSection = sectionMatch[1].toLowerCase() as 'added' | 'changed' | 'fixed';
      currentItem = null;
      continue;
    }
    
    // Match list items starting with "-"
    if (line.startsWith('-') && currentEntry && currentSection) {
      const text = line.substring(1).trim();
      if (text) {
        currentItem = { text, children: [] };
        currentEntry[currentSection].push(currentItem);
      }
      continue;
    }
    
    // Match sub-items (indented with spaces)
    if (line.startsWith(' ') && currentItem) {
      const text = line.trim();
      if (text.startsWith('-')) {
        currentItem.children.push(text.substring(1).trim());
      }
    }
  }
  
  if (currentEntry) {
    entries.push(currentEntry);
  }
  
  return entries;
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
        content = fs.readFileSync(changelogPath, 'utf-8');
        found = true;
        break;
      } catch (err) {
        // Continue to next path
      }
    }
    
    if (!found) {
      throw new Error('Changelog file not found in any expected location');
    }
    
    const entries = parseChangelog(content);
    
    return NextResponse.json({ 
      success: true, 
      entries: entries.reverse() // Show newest first
    });
  } catch (error) {
    console.error('Error parsing changelog:', error);
    return NextResponse.json({ 
      success: false, 
      entries: [],
      error: 'Failed to parse changelog'
    });
  }
}
