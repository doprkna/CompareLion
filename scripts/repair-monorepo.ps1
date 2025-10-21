#!/usr/bin/env pwsh
# Monorepo Dependency & Dev Script Repair
# Version 0.12.10f - 2025-10-17

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🧠 PAREL MONOREPO REPAIR" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify pnpm is installed
Write-Host "Step 1: Verifying pnpm installation..." -ForegroundColor Yellow

try {
    $pnpmVersion = pnpm --version
    Write-Host "  ✅ pnpm version: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ERROR: pnpm is not installed!" -ForegroundColor Red
    Write-Host "  Install pnpm: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Clean up broken node_modules
Write-Host "Step 2: Cleaning up node_modules..." -ForegroundColor Yellow

$nodeModulesPaths = @(
    "node_modules",
    "apps\web\node_modules",
    "apps\worker\node_modules",
    "packages\db\node_modules"
)

foreach ($path in $nodeModulesPaths) {
    if (Test-Path $path) {
        Write-Host "  🗑️  Removing: $path" -ForegroundColor Red
        Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
    }
}

Write-Host "  ✅ Cleanup complete" -ForegroundColor Green
Write-Host ""

# Step 3: Clean up .next build cache
Write-Host "Step 3: Cleaning up .next build cache..." -ForegroundColor Yellow

if (Test-Path "apps\web\.next") {
    Write-Host "  🗑️  Removing: apps\web\.next" -ForegroundColor Red
    Remove-Item -Recurse -Force "apps\web\.next" -ErrorAction SilentlyContinue
}

Write-Host "  ✅ Build cache cleaned" -ForegroundColor Green
Write-Host ""

# Step 4: Install dependencies
Write-Host "Step 4: Installing dependencies with pnpm..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray

try {
    pnpm install --legacy-peer-deps
    Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ERROR: Failed to install dependencies" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Try running manually:" -ForegroundColor Yellow
    Write-Host "  pnpm install --legacy-peer-deps" -ForegroundColor White
    exit 1
}

Write-Host ""

# Step 5: Verify workspace structure
Write-Host "Step 5: Verifying workspace structure..." -ForegroundColor Yellow

$workspaces = @(
    "apps\web",
    "apps\worker",
    "packages\db"
)

$allWorkspacesExist = $true
foreach ($workspace in $workspaces) {
    if (Test-Path "$workspace\package.json") {
        Write-Host "  ✅ Workspace found: $workspace" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing workspace: $workspace" -ForegroundColor Red
        $allWorkspacesExist = $false
    }
}

if (-not $allWorkspacesExist) {
    Write-Host ""
    Write-Host "  ⚠️  WARNING: Some workspaces are missing!" -ForegroundColor Yellow
    Write-Host "  The monorepo may not function correctly." -ForegroundColor Yellow
}

Write-Host ""

# Step 6: Verify critical dependencies
Write-Host "Step 6: Verifying critical dependencies..." -ForegroundColor Yellow

$criticalDeps = @{
    "concurrently" = "node_modules\concurrently"
    "next" = "apps\web\node_modules\next"
    "tsx" = "node_modules\tsx"
}

$allDepsInstalled = $true
foreach ($dep in $criticalDeps.GetEnumerator()) {
    if (Test-Path $dep.Value) {
        Write-Host "  ✅ $($dep.Key) installed" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($dep.Key) missing" -ForegroundColor Red
        $allDepsInstalled = $false
    }
}

if (-not $allDepsInstalled) {
    Write-Host ""
    Write-Host "  ⚠️  WARNING: Some critical dependencies are missing!" -ForegroundColor Yellow
    Write-Host "  Try running: pnpm install --legacy-peer-deps" -ForegroundColor Yellow
}

Write-Host ""

# Step 7: Verify dev scripts
Write-Host "Step 7: Verifying dev scripts..." -ForegroundColor Yellow

$rootPackageJson = Get-Content "package.json" | ConvertFrom-Json
$webPackageJson = Get-Content "apps\web\package.json" | ConvertFrom-Json
$workerPackageJson = Get-Content "apps\worker\package.json" | ConvertFrom-Json

if ($rootPackageJson.scripts.dev) {
    Write-Host "  ✅ Root dev script: $($rootPackageJson.scripts.dev)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Root dev script missing!" -ForegroundColor Red
}

if ($webPackageJson.scripts.dev) {
    Write-Host "  ✅ Web dev script: $($webPackageJson.scripts.dev)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Web dev script missing!" -ForegroundColor Red
}

if ($workerPackageJson.scripts.dev) {
    Write-Host "  ✅ Worker dev script: $($workerPackageJson.scripts.dev)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Worker dev script missing!" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ MONOREPO REPAIR COMPLETE" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start the dev server: pnpm dev" -ForegroundColor White
Write-Host "  2. Web app will be available at: http://localhost:3000" -ForegroundColor White
Write-Host "  3. Worker will run in parallel" -ForegroundColor White
Write-Host ""
Write-Host "Important reminders:" -ForegroundColor Yellow
Write-Host "  ✅ Always use 'pnpm' instead of 'npm'" -ForegroundColor White
Write-Host "  ✅ Use '--legacy-peer-deps' flag for installations" -ForegroundColor White
Write-Host "  ❌ Never use 'npm install' in a pnpm workspace" -ForegroundColor White
Write-Host ""



