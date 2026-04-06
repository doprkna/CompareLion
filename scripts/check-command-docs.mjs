#!/usr/bin/env node
/**
 * Documentation gate: if package.json scripts change, docs/COMMANDS.md must be updated.
 * Exit 1 if COMMANDS.md hash is missing or stale.
 */

import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadScripts(pkgPath) {
  if (!existsSync(pkgPath)) return [];
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const scripts = pkg.scripts ?? {};
  return Object.keys(scripts).sort();
}

function computeHash() {
  const rootScripts = loadScripts(join(root, "package.json"));
  const webScripts = loadScripts(join(root, "apps", "web", "package.json"));
  const dbScripts = loadScripts(join(root, "packages", "db", "package.json"));

  const payload = [
    `root:${rootScripts.join(",")}`,
    `apps/web:${webScripts.join(",")}`,
    `packages/db:${dbScripts.join(",")}`,
  ].join("\n");

  return createHash("sha256").update(payload).digest("hex");
}

function extractStoredHash(mdPath) {
  const content = readFileSync(mdPath, "utf8");
  const m = content.match(/<!-- commands-hash: ([a-f0-9]+) -->/);
  return m ? m[1] : null;
}

const mdPath = join(root, "docs", "COMMANDS.md");
const current = computeHash();
const stored = existsSync(mdPath) ? extractStoredHash(mdPath) : null;

if (!stored || stored !== current) {
  console.error("COMMANDS.md is out of date. Run pnpm docs:commands:update");
  process.exit(1);
}
