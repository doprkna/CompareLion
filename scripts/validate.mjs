#!/usr/bin/env node
/**
 * Minimal reliable validate chain: check:dev-sanity, typecheck, test.
 * Skips missing scripts gracefully.
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const scripts = pkg.scripts ?? {};

const chain = ["check:dev-sanity", "typecheck", "test"];

for (const name of chain) {
  if (!(name in scripts)) {
    console.log("skipped: " + name + " missing");
    continue;
  }
  const r = spawnSync("pnpm", ["run", name], {
    stdio: "inherit",
    cwd: root,
    shell: true,
  });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}
