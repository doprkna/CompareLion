#!/usr/bin/env node
/**
 * Check that all JSX components used in app (recursive .tsx) are imported.
 * Fails with exit 1 if any <PascalCase /> is used without a matching import.
 * Prevents "ReferenceError: X is not defined" at runtime.
 *
 * Run from repo root: pnpm web:check-imports
 * Run from apps/web: node check-imports.js
 */

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, 'app');
const JSX_TAG = /<([A-Z][a-zA-Z0-9.]*)(?:\s|>|\/)/g;
const DEFAULT_IMPORT = /import\s+(\w+)\s+from\s+['"]/g;
const NAMED_IMPORTS = /import\s+(?:type\s+)?\{\s*([^}]+)\s*\}\s+from\s+['"]/g;
const NAMESPACE_IMPORT = /import\s+\*\s+as\s+(\w+)\s+from\s+['"]/g;
const LOCAL_FUNCTION = /function\s+([A-Z][a-zA-Z0-9]*)\s*\(/g;
const LOCAL_CONST = /const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*(?:function|\(|dynamic\()/g;
const LOCAL_INTERFACE_TYPE = /(?:interface|type)\s+([A-Z][a-zA-Z0-9]*)\s*[={]/g;
const INTRINSICS = new Set(
  'a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p picture pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup svg table tbody td template textarea tfoot th thead time title tr track u ul var video wbr'.split(' ')
);
// TypeScript/DOM types often appear as <Type> in .tsx (generics/assertions), not JSX
const TYPE_NAMES = new Set([
  'File', 'Blob', 'MediaRecorder', 'MediaStream', 'HTMLInputElement', 'HTMLDivElement',
  'HTMLAudioElement', 'HTMLCanvasElement', 'SVGSVGElement', 'Element', 'HTMLElement',
  'NodeJS.Timeout', 'React.ReactNode', 'React.ReactElement', 'JSX.Element'
]);

function* walkTsx(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walkTsx(full);
    else if (e.isFile() && e.name.endsWith('.tsx')) yield full;
  }
}

function extractJsxComponents(content) {
  const names = new Set();
  let m;
  JSX_TAG.lastIndex = 0;
  while ((m = JSX_TAG.exec(content)) !== null) {
    const name = m[1];
    if (INTRINSICS.has(name.toLowerCase())) continue;
    names.add(name);
  }
  return names;
}

function extractImports(content) {
  const imported = new Set();
  let m;
  DEFAULT_IMPORT.lastIndex = 0;
  while ((m = DEFAULT_IMPORT.exec(content)) !== null) imported.add(m[1]);
  NAMED_IMPORTS.lastIndex = 0;
  while ((m = NAMED_IMPORTS.exec(content)) !== null) {
    m[1].split(',').forEach(part => {
      const alias = part.split(/\s+as\s+/).pop().trim().split(',')[0].trim();
      const name = part.trim().split(/\s/)[0];
      imported.add(name);
      if (alias !== name) imported.add(alias);
    });
  }
  NAMESPACE_IMPORT.lastIndex = 0;
  while ((m = NAMESPACE_IMPORT.exec(content)) !== null) imported.add(m[1]);
  LOCAL_FUNCTION.lastIndex = 0;
  while ((m = LOCAL_FUNCTION.exec(content)) !== null) imported.add(m[1]);
  LOCAL_CONST.lastIndex = 0;
  while ((m = LOCAL_CONST.exec(content)) !== null) imported.add(m[1]);
  LOCAL_INTERFACE_TYPE.lastIndex = 0;
  while ((m = LOCAL_INTERFACE_TYPE.exec(content)) !== null) imported.add(m[1]);
  // Block-scoped component refs (e.g. const Icon = ... inside .map)
  if (/const\s+Icon\s*=/.test(content)) imported.add('Icon');
  if (/const\s+VisibilityIcon\s*=/.test(content)) imported.add('VisibilityIcon');
  return imported;
}

function main() {
  const failures = [];
  for (const file of walkTsx(APP_DIR)) {
    const content = fs.readFileSync(file, 'utf8');
    const used = extractJsxComponents(content);
    const imported = extractImports(content);
    const rel = path.relative(path.join(__dirname, '..'), file);
  for (const name of used) {
    if (TYPE_NAMES.has(name)) continue;
    const base = name.includes('.') ? name.split('.')[0] : name;
    if (!imported.has(name) && !imported.has(base)) {
      failures.push({ file: rel, component: name });
    }
  }
  }

  if (failures.length === 0) {
    console.log('web:check-imports OK – all JSX components are imported.');
    process.exit(0);
  }

  console.error('web:check-imports FAILED – components used in JSX but not imported:\n');
  failures.forEach(({ file, component }) => {
    console.error(`  ${file}: <${component} /> is not imported`);
  });
  console.error('\nAdd the missing import or create a placeholder component.');
  process.exit(1);
}

main();
