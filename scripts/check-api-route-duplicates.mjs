#!/usr/bin/env node
/**
 * Check for duplicate API route files that cause Next.js "Duplicate page detected" warnings.
 * Fails if any directory contains both route.ts and route.js (or tsx+jsx).
 * v0.45.7 - CI safety check
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_DIR = path.join(__dirname, '..', 'apps', 'web', 'app', 'api');

function findApiRouteDirs(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      findApiRouteDirs(full, results);
    } else if (e.isFile() && e.name.startsWith('route.')) {
      const parent = path.dirname(full);
      if (!results.includes(parent)) results.push(parent);
    }
  }
  return results;
}

function getRouteFiles(dir) {
  const files = fs.readdirSync(dir);
  const has = (ext) => files.includes(`route${ext}`);
  return {
    ts: has('.ts'),
    tsx: has('.tsx'),
    js: has('.js'),
    jsx: has('.jsx'),
  };
}

function hasDuplicate(files) {
  return (
    (files.ts && files.js) ||
    (files.tsx && files.jsx) ||
    (files.ts && files.jsx) ||
    (files.tsx && files.js)
  );
}

function run() {
  const dirs = findApiRouteDirs(API_DIR);
  const offenders = [];
  for (const dir of dirs) {
    const files = getRouteFiles(dir);
    if (hasDuplicate(files)) {
      const rel = path.relative(path.join(__dirname, '..'), dir);
      offenders.push(rel);
    }
  }

  if (offenders.length > 0) {
    console.error('ERROR: Duplicate API route files detected (route.ts + route.js or route.tsx + route.jsx):');
    offenders.forEach((d) => console.error('  -', d));
    console.error('\nRemove the .js/.jsx duplicates; keep only .ts/.tsx as canonical.');
    process.exit(1);
  }

  console.log('OK');
}

run();
