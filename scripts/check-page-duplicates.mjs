#!/usr/bin/env node
/**
 * Check for duplicate page/layout/middleware files (page.jsx + page.tsx etc).
 * Fails if any dir has both JS and TS/TSX versions of same route file.
 * v0.45.24 - Dev sanity
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.join(__dirname, '..', 'apps', 'web');

const ROUTE_NAMES = ['page', 'layout', 'loading', 'error', 'not-found', 'template', 'default', 'middleware'];

function hasDuplicate(dir, base) {
  const files = fs.readdirSync(dir);
  const has = (name, ext) => files.includes(`${name}${ext}`);
  for (const name of ROUTE_NAMES) {
    const a = (has(name, '.js') && (has(name, '.ts') || has(name, '.tsx')));
    const b = (has(name, '.jsx') && (has(name, '.ts') || has(name, '.tsx')));
    if (a || b) return true;
  }
  return false;
}

function walk(dir, base, results) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const rel = path.join(base, e.name);
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
      if (!(base === 'app' && e.name === 'api')) {
        if (hasDuplicate(full, rel)) results.push(path.relative(WEB, full));
        walk(full, rel, results);
      }
    }
  }
}

function run() {
  const offenders = [];
  walk(path.join(WEB, 'app'), 'app', offenders);
  const mwDir = WEB;
  if (hasDuplicate(mwDir, '')) offenders.push('(root middleware)');
  if (offenders.length > 0) {
    console.error('ERROR: Duplicate page/layout/middleware (JS+TS same name):');
    offenders.forEach((d) => console.error('  -', d));
    console.error('\nRemove .js/.jsx; keep .ts/.tsx.');
    process.exit(1);
  }
  console.log('OK');
}

run();
