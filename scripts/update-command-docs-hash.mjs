#!/usr/bin/env node
/**
 * Update the commands-hash marker in docs/COMMANDS.md.
 * Call this after changing any package.json scripts.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
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

const mdPath = join(root, "docs", "COMMANDS.md");
const hash = computeHash();
const marker = `<!-- commands-hash: ${hash} -->`;

if (!existsSync(mdPath)) {
  writeFileSync(mdPath, marker + "\n", "utf8");
} else {
  const content = readFileSync(mdPath, "utf8");
  const updated = content.replace(
    /<!-- commands-hash: [a-f0-9]+ -->/,
    marker
  );
  if (updated === content && !content.includes("commands-hash")) {
    writeFileSync(mdPath, marker + "\n\n" + content, "utf8");
  } else {
    writeFileSync(mdPath, updated, "utf8");
  }
}

console.log("Updated docs/COMMANDS.md hash");
