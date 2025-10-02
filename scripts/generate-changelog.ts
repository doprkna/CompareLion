import fs from 'fs';
import path from 'path';

type Changelog = Array<{
  version: string;
  date: string | null;
  added: string[];
  changed: string[];
  fixed: string[];
}>;

function parseChangelog(md: string): Changelog {
  const lines = md.split(/\r?\n/);
  const changelog: Changelog = [];
  let current: any = null;
  let section: 'added' | 'changed' | 'fixed' | null = null;

  for (const raw of lines) {
    const line = raw.trimEnd();
    const versionMatch = line.match(/^## \[(.+?)\] - (\d{4}-\d{2}-\d{2}|Unreleased)/);
    if (versionMatch) {
      if (current) changelog.push(current);
      current = {
        version: versionMatch[1],
        date: versionMatch[2] === 'Unreleased' ? null : versionMatch[2],
        added: [] as string[],
        changed: [] as string[],
        fixed: [] as string[],
      };
      section = null;
      continue;
    }
    if (!current) continue;
    if (line.startsWith('### Added')) { section = 'added'; continue; }
    if (line.startsWith('### Changed')) { section = 'changed'; continue; }
    if (line.startsWith('### Fixed')) { section = 'fixed'; continue; }
    if (section && line.startsWith('-')) {
      current[section].push(line.replace(/^-/,'').trim());
    }
  }
  if (current) changelog.push(current);
  return changelog;
}

async function main() {
  // Automatic changelog generation disabled - manual changelog management
  console.log('Automatic changelog generation is disabled.');
  console.log('Changelog is now managed manually.');
  console.log('To re-enable, uncomment the code below and run this script manually.');
  
  // DISABLED: Automatic changelog parsing and generation
  // const mdPath = path.join(__dirname, '..', 'apps', 'web', 'CHANGELOG.md');
  // const outPath = path.join(__dirname, '..', 'changelog.json');
  // const md = fs.readFileSync(mdPath, 'utf-8');
  // const data = parseChangelog(md);
  // fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  // console.log(`Wrote changelog.json with ${data.length} entries`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
