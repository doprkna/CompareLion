import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  let text: string;
  try {
    text = await fs.readFile(changelogPath, 'utf-8');
  } catch {
    return NextResponse.json({ success: false, message: 'Changelog unavailable' }, { status: 200 });
  }
  try {
    const entries: Array<{ version: string; date?: string; added: { text: string; children: string[] }[]; changed: { text: string; children: string[] }[]; fixed: { text: string; children: string[] }[] }> = [];
    const lines = text.split(/\r?\n/);
    let currentEntry: any = null;
    let currentSection: 'added' | 'changed' | 'fixed' | '' = '';
    let lastBullet: { text: string; children: string[] } | null = null;
    for (const raw of lines) {
      const line = raw;
      if (line.startsWith('## [')) {
        const m = line.match(/^## \[([^\]]+)\](?: - (.+))?/);
        if (m) {
          const version = m[1];
          const date = m[2];
          if (version === 'Unreleased') {
            currentEntry = null;
            continue;
          }
          currentEntry = { version, date, added: [], changed: [], fixed: [] };
          entries.push(currentEntry);
          currentSection = '';
          lastBullet = null;
        }
      } else if (currentEntry && line.startsWith('### ')) {
        const sec = line.substr(4).trim().toLowerCase();
        if (sec === 'added' || sec === 'changed' || sec === 'fixed') {
          currentSection = sec;
          lastBullet = null;
        }
      } else if (currentEntry && line.startsWith('  - ')) {
        const child = line.substr(4);
        if (lastBullet) lastBullet.children.push(child);
      } else if (currentEntry && currentSection && line.startsWith('- ')) {
        const textLine = line.substr(2);
        const bullet = { text: textLine, children: [] };
        currentEntry[currentSection].push(bullet);
        lastBullet = bullet;
      }
    }
    // newest-first
    const ordered = entries;
    return NextResponse.json({ success: true, entries: ordered });
  } catch {
    return NextResponse.json({ success: false, message: 'Error parsing changelog' }, { status: 200 });
  }
}
