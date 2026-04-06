#!/usr/bin/env node
/**
 * Check for conflicting dynamic route params (e.g. [id] vs [slug] under same parent).
 * Next.js fails with "You cannot use different slug names for the same dynamic path".
 * v0.45.23 - Dev sanity guardrail
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const APP_API = path.join(ROOT, 'apps', 'web', 'app', 'api');

// Match [param] or [...param]
const DYNAMIC_REGEX = /^\[\.{0,3}(\w+)\]$/;

function getDirectories(parent) {
  if (!fs.existsSync(parent)) return [];
  return fs
    .readdirSync(parent, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

function extractParam(name) {
  const m = name.match(DYNAMIC_REGEX);
  return m ? m[1] : null;
}

function scanDir(dir, results = []) {
  const entries = getDirectories(dir);
  const dynamic = entries
    .map((name) => ({ name, param: extractParam(name) }))
    .filter((x) => x.param);

  if (dynamic.length >= 2) {
    const params = [...new Set(dynamic.map((x) => x.param))];
    if (params.length > 1) {
      const rel = path.relative(ROOT, dir);
      results.push({
        dir: rel,
        siblings: dynamic.map((x) => x.name),
        params,
      });
    }
  }

  for (const name of entries) {
    const full = path.join(dir, name);
    scanDir(full, results);
  }
  return results;
}

function run() {
  const conflicts = scanDir(APP_API);

  if (conflicts.length === 0) {
    console.log('OK: No dynamic route param conflicts in app/api');
    process.exit(0);
  }

  console.error('ERROR: Conflicting dynamic route params (same parent, different param names):\n');
  for (const c of conflicts) {
    console.error(`  ${c.dir}/`);
    console.error(`    Siblings: ${c.siblings.join(', ')} → params: ${c.params.join(' vs ')}`);
    console.error(
      `    Fix: Merge into one route (e.g. [id] with ?by=slug override) or use static prefix (e.g. by-slug/[slug])`
    );
    console.error('');
  }
  process.exit(1);
}

run();
