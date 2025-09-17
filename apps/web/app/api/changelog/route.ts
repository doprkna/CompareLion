import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  let text: string;
  try {
    text = await fs.readFile(changelogPath, 'utf-8');
  } catch {
    return NextResponse.json({ success: false, message: 'CHANGELOG.md not found' }, { status: 404 });
  }
  const entries: Array<{ version: string; date?: string; added: { text: string; children: string[] }[]; changed: { text: string; children: string[] }[]; fixed: { text: string; children: string[] }[] }> = [];
  const sections = text.split(/^## \[/m).slice(1);
  for (const sec of sections) {
    const headerLine = sec.split('\n')[0];
    const headerMatch = headerLine.match(/^([^\]]+)\](?: - ([0-9]{4}-[0-9]{2}-[0-9]{2}))?/);
    if (!headerMatch) continue;
    const [_, version, date] = headerMatch;
    const body = sec.substring(headerLine.length);
    // Parse sections with nested bullets
    const parseItems = (sectionBody: string) => {
      const items: { text: string; children: string[] }[] = [];
      const lines = sectionBody.split('\n');
      for (const line of lines) {
        const match = line.match(/^(\s*)- (.+)$/);
        if (match) {
          const indent = match[1].length;
          const textLine = match[2].trim();
          if (indent === 0) {
            items.push({ text: textLine, children: [] });
          } else {
            const last = items[items.length - 1];
            if (last) last.children.push(textLine);
          }
        }
      }
      return items;
    };
    const added = parseItems(body.match(/### Added\s*([\s\S]*?)(?=(###|$))/)?.[1] || '');
    const changed = parseItems(body.match(/### Changed\s*([\s\S]*?)(?=(###|$))/)?.[1] || '');
    const fixed = parseItems(body.match(/### Fixed\s*([\s\S]*?)(?=(###|$))/)?.[1] || '');
    entries.push({ version, date, added, changed, fixed });
  }
  return NextResponse.json({ success: true, entries });
}
