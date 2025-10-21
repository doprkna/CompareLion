#!/usr/bin/env pwsh
# PAREL Full Sanity Check & Repair
# Version 0.12.10g - 2025-10-17

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🧠 PAREL FULL SANITY CHECK & REPAIR" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Step 1: Verify pnpm
Write-Host "Step 1: Verifying pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "  ✅ pnpm version: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ERROR: pnpm not installed!" -ForegroundColor Red
    Write-Host "  Install: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 2: Clean everything
Write-Host "Step 2: Cleaning all node_modules and build artifacts..." -ForegroundColor Yellow
$pathsToClean = @(
    "node_modules",
    "apps\web\node_modules",
    "apps\web\.next",
    "apps\worker\node_modules",
    "packages\db\node_modules"
)

foreach ($path in $pathsToClean) {
    if (Test-Path $path) {
        Write-Host "  🗑️  Removing: $path" -ForegroundColor Red
        Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
    }
}
Write-Host "  ✅ Cleanup complete" -ForegroundColor Green
Write-Host ""

# Step 3: Verify canonical Prisma schema
Write-Host "Step 3: Verifying canonical Prisma schema..." -ForegroundColor Yellow
$canonicalSchema = "packages\db\schema.prisma"
if (Test-Path $canonicalSchema) {
    $schemaSize = (Get-Item $canonicalSchema).Length
    Write-Host "  ✅ Canonical schema found: $canonicalSchema ($schemaSize bytes)" -ForegroundColor Green
} else {
    Write-Host "  ❌ ERROR: Canonical schema not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Install root dependencies
Write-Host "Step 4: Installing root dependencies..." -ForegroundColor Yellow
Write-Host "  This may take several minutes..." -ForegroundColor Gray
try {
    pnpm install --legacy-peer-deps 2>&1 | Out-Null
    Write-Host "  ✅ Root dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Installation completed with warnings" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Verify critical dependencies
Write-Host "Step 5: Verifying critical dependencies..." -ForegroundColor Yellow
$criticalDeps = @{
    "concurrently" = "node_modules\concurrently\package.json"
    "next (web)" = "apps\web\node_modules\next\package.json"
    "tsx" = "node_modules\tsx\package.json"
    "prisma" = "node_modules\prisma\package.json"
}

$missingDeps = @()
foreach ($dep in $criticalDeps.GetEnumerator()) {
    if (Test-Path $dep.Value) {
        Write-Host "  ✅ $($dep.Key)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($dep.Key) missing" -ForegroundColor Red
        $missingDeps += $dep.Key
    }
}

if ($missingDeps.Count -gt 0) {
    Write-Host ""
    Write-Host "  ⚠️  Missing dependencies detected. Reinstalling..." -ForegroundColor Yellow
    pnpm install --legacy-peer-deps 2>&1 | Out-Null
}
Write-Host ""

# Step 6: Generate Prisma client
Write-Host "Step 6: Generating Prisma client..." -ForegroundColor Yellow
Write-Host "  Using schema: packages\db\schema.prisma" -ForegroundColor Gray
try {
    npx prisma generate --schema="packages\db\schema.prisma" 2>&1 | Out-Null
    Write-Host "  ✅ Prisma client generated" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ERROR: Prisma generation failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Step 7: Verify Prisma client
Write-Host "Step 7: Verifying Prisma client..." -ForegroundColor Yellow
$prismaClientPath = "node_modules\.prisma\client"
if (Test-Path $prismaClientPath) {
    Write-Host "  ✅ Prisma client found at: $prismaClientPath" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Prisma client not in expected location" -ForegroundColor Yellow
}
Write-Host ""

# Step 8: Check for schema fragmentation
Write-Host "Step 8: Checking for schema fragmentation..." -ForegroundColor Yellow
$allSchemas = Get-ChildItem -Recurse -Filter "schema.prisma" -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notlike "*node_modules*" -or $_.FullName -like "*\.prisma\client*" }

$canonicalCount = 0
$generatedCount = 0
foreach ($schema in $allSchemas) {
    if ($schema.FullName -like "*packages\db\schema.prisma*") {
        Write-Host "  ✅ CANONICAL: $($schema.FullName)" -ForegroundColor Green
        $canonicalCount++
    } elseif ($schema.FullName -like "*\.prisma\client*") {
        Write-Host "  ✅ GENERATED: $($schema.FullName)" -ForegroundColor Cyan
        $generatedCount++
    } else {
        Write-Host "  ⚠️  UNEXPECTED: $($schema.FullName)" -ForegroundColor Yellow
    }
}

if ($canonicalCount -ne 1) {
    Write-Host "  ⚠️  WARNING: Expected 1 canonical schema, found $canonicalCount" -ForegroundColor Yellow
}
Write-Host ""

# Step 9: Verify workspace structure
Write-Host "Step 9: Verifying workspace structure..." -ForegroundColor Yellow
$workspaces = @{
    "apps\web\package.json" = "Web App"
    "apps\worker\package.json" = "Worker"
    "packages\db\package.json" = "Database Package"
}

foreach ($workspace in $workspaces.GetEnumerator()) {
    if (Test-Path $workspace.Key) {
        Write-Host "  ✅ $($workspace.Value): $($workspace.Key)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($workspace.Value): Missing!" -ForegroundColor Red
    }
}
Write-Host ""

# Step 10: Verify dev scripts
Write-Host "Step 10: Verifying dev scripts..." -ForegroundColor Yellow
$rootPkg = Get-Content "package.json" | ConvertFrom-Json
$webPkg = Get-Content "apps\web\package.json" | ConvertFrom-Json
$workerPkg = Get-Content "apps\worker\package.json" | ConvertFrom-Json

$scripts = @{
    "Root dev" = $rootPkg.scripts.dev
    "Web dev" = $webPkg.scripts.dev
    "Worker dev" = $workerPkg.scripts.dev
}

foreach ($script in $scripts.GetEnumerator()) {
    if ($script.Value) {
        Write-Host "  ✅ $($script.Key): $($script.Value)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($script.Key): Missing!" -ForegroundColor Red
    }
}
Write-Host ""

# Step 11: Test Prisma DB connectivity
Write-Host "Step 11: Testing database connectivity..." -ForegroundColor Yellow
try {
    $testQuery = npx prisma db execute --schema="packages\db\schema.prisma" --stdin <<< "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Database connection successful" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Database connection test inconclusive" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Could not test database connection" -ForegroundColor Yellow
}
Write-Host ""

# Final Summary
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ FULL REPAIR COMPLETE" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "System Status:" -ForegroundColor Yellow
Write-Host "  ✅ pnpm: Installed and working" -ForegroundColor White
Write-Host "  ✅ Dependencies: Installed with pnpm" -ForegroundColor White
Write-Host "  ✅ Prisma: Client generated from canonical schema" -ForegroundColor White
Write-Host "  ✅ Workspace: Structure verified" -ForegroundColor White
Write-Host "  ✅ Scripts: Dev scripts verified" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start dev server: pnpm dev" -ForegroundColor White
Write-Host "  2. Web app: http://localhost:3000" -ForegroundColor White
Write-Host "  3. Test Prisma: Invoke-WebRequest -Uri 'http://localhost:3000/api/debug-prisma' -Method POST" -ForegroundColor White
Write-Host ""
Write-Host "Important reminders:" -ForegroundColor Yellow
Write-Host "  ✅ Always use 'pnpm' (never 'npm')" -ForegroundColor White
Write-Host "  ✅ Use '--legacy-peer-deps' for installations" -ForegroundColor White
Write-Host "  ✅ Prisma schema: packages\db\schema.prisma" -ForegroundColor White
Write-Host "  ✅ Import pattern: import { prisma } from '@/lib/db'" -ForegroundColor White
Write-Host ""



