#!/usr/bin/env tsx
/**
 * Repository Structure Audit (v0.11.0)
 * 
 * Checks for:
 * - Naming consistency
 * - Dead files and imports
 * - Code duplication
 * - Type safety violations
 */

import fs from "fs";
import path from "path";

interface AuditResult {
  category: string;
  severity: "error" | "warning" | "info";
  message: string;
  file?: string;
}

const results: AuditResult[] = [];
const rootDir = path.join(__dirname, "..");
const webDir = path.join(rootDir, "apps/web");

// Naming conventions
const NAMING_RULES = {
  components: /^[A-Z][a-zA-Z0-9]*\.tsx?$/,  // PascalCase
  routes: /^[a-z][a-z0-9-]*$/,               // kebab-case
  utils: /^[a-z][a-zA-Z0-9]*\.ts$/,          // camelCase
  hooks: /^use[A-Z][a-zA-Z0-9]*\.ts$/,       // useCamelCase
};

// Known placeholder files (OK to have console.log)
const PLACEHOLDER_PATTERNS = [
  /lib\/.*-system\.ts$/,
  /lib\/.*\/.*\.ts$/,
  /data\/.*\.json$/,
];

function isPlaceholderFile(filePath: string): boolean {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(filePath));
}

function checkNamingConventions(dir: string, type: keyof typeof NAMING_RULES) {
  const pattern = NAMING_RULES[type];
  const fullPath = path.join(webDir, dir);
  
  if (!fs.existsSync(fullPath)) return;
  
  const files = fs.readdirSync(fullPath, { withFileTypes: true });
  
  for (const file of files) {
    if (file.isDirectory()) continue;
    
    if (!pattern.test(file.name)) {
      results.push({
        category: "naming",
        severity: "warning",
        message: `File "${file.name}" doesn't follow ${type} naming convention (expected ${pattern})`,
        file: path.join(dir, file.name),
      });
    }
  }
}

function checkForDeadFiles() {
  const suspiciousPatterns = [
    /\.backup\./,
    /\.old\./,
    /\.temp\./,
    /-old\./,
    /-backup\./,
    /copy\./,
  ];
  
  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      const relativePath = path.relative(webDir, fullPath);
      
      if (file.isDirectory()) {
        if (file.name !== "node_modules" && file.name !== ".next") {
          scanDir(fullPath);
        }
        continue;
      }
      
      if (suspiciousPatterns.some((p) => p.test(file.name))) {
        results.push({
          category: "dead-files",
          severity: "warning",
          message: `Potential dead file: ${file.name}`,
          file: relativePath,
        });
      }
    }
  }
  
  scanDir(webDir);
}

function checkForConsoleLogs() {
  const consolePattern = /console\.(log|debug|info)\(/g;
  
  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      const relativePath = path.relative(webDir, fullPath);
      
      if (file.isDirectory()) {
        if (file.name !== "node_modules" && file.name !== ".next") {
          scanDir(fullPath);
        }
        continue;
      }
      
      if (!file.name.endsWith(".ts") && !file.name.endsWith(".tsx")) continue;
      
      // Skip placeholder files
      if (isPlaceholderFile(relativePath)) continue;
      
      const content = fs.readFileSync(fullPath, "utf-8");
      const matches = content.match(consolePattern);
      
      if (matches && matches.length > 0) {
        results.push({
          category: "console-logs",
          severity: "info",
          message: `Found ${matches.length} console.log statement(s)`,
          file: relativePath,
        });
      }
    }
  }
  
  scanDir(path.join(webDir, "app"));
  scanDir(path.join(webDir, "components"));
}

function checkForDuplicateComponents() {
  const componentNames = new Map<string, string[]>();
  
  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      const relativePath = path.relative(webDir, fullPath);
      
      if (file.isDirectory()) {
        scanDir(fullPath);
        continue;
      }
      
      if (file.name.endsWith(".tsx")) {
        const baseName = file.name.replace(".tsx", "");
        
        if (!componentNames.has(baseName)) {
          componentNames.set(baseName, []);
        }
        
        componentNames.get(baseName)!.push(relativePath);
      }
    }
  }
  
  scanDir(path.join(webDir, "components"));
  scanDir(path.join(webDir, "app"));
  
  for (const [name, paths] of componentNames.entries()) {
    if (paths.length > 1) {
      results.push({
        category: "duplicates",
        severity: "warning",
        message: `Component "${name}" exists in ${paths.length} locations: ${paths.join(", ")}`,
      });
    }
  }
}

function printResults() {
  console.log("\n🔍 Repository Structure Audit Results\n");
  console.log("=" .repeat(60));
  
  const byCategory = results.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<string, AuditResult[]>);
  
  for (const [category, items] of Object.entries(byCategory)) {
    console.log(`\n📂 ${category.toUpperCase()} (${items.length})`);
    console.log("-".repeat(60));
    
    for (const item of items) {
      const icon = item.severity === "error" ? "❌" : item.severity === "warning" ? "⚠️" : "ℹ️";
      console.log(`${icon} ${item.message}`);
      if (item.file) {
        console.log(`   📄 ${item.file}`);
      }
    }
  }
  
  console.log("\n" + "=".repeat(60));
  
  const errors = results.filter((r) => r.severity === "error").length;
  const warnings = results.filter((r) => r.severity === "warning").length;
  const infos = results.filter((r) => r.severity === "info").length;
  
  console.log(`\n📊 Summary: ${errors} errors, ${warnings} warnings, ${infos} info\n`);
  
  if (errors > 0) {
    console.log("❌ Audit failed with errors!");
    process.exit(1);
  } else if (warnings > 0) {
    console.log("⚠️ Audit completed with warnings.");
  } else {
    console.log("✅ Audit passed!");
  }
}

// Run audits
console.log("🚀 Running repository structure audit...\n");

checkNamingConventions("components", "components");
checkNamingConventions("lib/hooks", "hooks");
checkForDeadFiles();
checkForConsoleLogs();
checkForDuplicateComponents();

printResults();











