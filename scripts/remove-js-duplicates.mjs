#!/usr/bin/env node
/**
 * Remove JS/JSX route files that shadow TS/TSX. Scope: app/, pages/, middleware only.
 * Validates TS has export before deleting. One-time use; check:page-duplicates prevents regressions.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.join(__dirname, '..', 'apps', 'web');

const ROUTE_NAMES = ['page', 'layout', 'loading', 'error', 'not-found', 'route', 'template', 'default'];
const PAIRS = [['.js', '.ts'], ['.jsx', '.tsx'], ['.js', '.tsx'], ['.jsx', '.ts']];

function* walk(dir, base = '') {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.join(base, e.name);
    if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules' && (base !== 'app' || e.name !== 'api')) {
      yield* walk(full, rel);
    } else if (e.isFile()) yield { name: e.name, full, base: path.dirname(full) };
  }
}

function isRoute(name) {
  return ROUTE_NAMES.includes(name.replace(/\.(js|jsx|ts|tsx)$/, ''));
}

function isValidTs(p) {
  if (!fs.existsSync(p)) return false;
  const c = fs.readFileSync(p, 'utf8');
  return c.replace(/\s/g, '').length >= 80 && /export\s+(default|function|const|async\s+function|class)/m.test(c);
}

const toDelete = [];
const skipped = [];
for (const { name, full, base } of walk(path.join(WEB, 'app'))) {
  if (!/\.(js|jsx)$/.test(name) || !isRoute(name)) continue;
  const baseName = name.replace(/\.(js|jsx)$/, '');
  for (const [from, to] of PAIRS) {
    if (!name.endsWith(from)) continue;
    const tsPath = path.join(base, baseName + to);
    if (!fs.existsSync(tsPath)) continue;
    if (isValidTs(tsPath)) toDelete.push(full);
    else skipped.push(full);
    break;
  }
}
const mwJs = path.join(WEB, 'middleware.js');
const mwTs = path.join(WEB, 'middleware.ts');
if (fs.existsSync(mwJs) && fs.existsSync(mwTs) && isValidTs(mwTs)) toDelete.push(mwJs);

console.log('Deleting', toDelete.length, '| Skipped', skipped.length);
skipped.forEach((f) => console.log('  skip:', path.relative(WEB, f)));
toDelete.forEach((f) => { if (fs.existsSync(f)) { fs.unlinkSync(f); console.log('  -', path.relative(WEB, f)); } });
