#!/usr/bin/env pwsh
# Prisma Multiverse Cleanup Script
# Version 0.12.10e - 2025-10-17

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🧠 PRISMA MULTIVERSE CLEANUP" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Remove all generated Prisma clients
Write-Host "Step 1: Removing generated Prisma clients..." -ForegroundColor Yellow

$prismaClientPaths = @(
    "apps\web\node_modules\.prisma",
    "packages\db\node_modules\.prisma",
    "node_modules\.prisma"
)

foreach ($path in $prismaClientPaths) {
    if (Test-Path $path) {
        Write-Host "  🗑️  Removing: $path" -ForegroundColor Red
        Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
    } else {
        Write-Host "  ✅ Already clean: $path" -ForegroundColor Green
    }
}

Write-Host ""

# Step 2: Verify canonical schema exists
Write-Host "Step 2: Verifying canonical schema..." -ForegroundColor Yellow

$canonicalSchema = "packages\db\schema.prisma"
if (Test-Path $canonicalSchema) {
    $schemaSize = (Get-Item $canonicalSchema).Length
    Write-Host "  ✅ Canonical schema found: $canonicalSchema ($schemaSize bytes)" -ForegroundColor Green
} else {
    Write-Host "  ❌ ERROR: Canonical schema not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Install dependencies
Write-Host "Step 3: Installing dependencies..." -ForegroundColor Yellow
Write-Host "  Running: pnpm install --legacy-peer-deps" -ForegroundColor Gray

try {
    pnpm install --legacy-peer-deps
    Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ERROR: Failed to install dependencies" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Generate Prisma client
Write-Host "Step 4: Generating Prisma client..." -ForegroundColor Yellow
Write-Host "  Running: npx prisma generate --schema=packages\db\schema.prisma" -ForegroundColor Gray

try {
    npx prisma generate --schema="packages\db\schema.prisma"
    Write-Host "  ✅ Prisma client generated" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ERROR: Failed to generate Prisma client" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 5: Verify generated client
Write-Host "Step 5: Verifying generated client..." -ForegroundColor Yellow

$generatedClientPath = "node_modules\.prisma\client"
if (Test-Path $generatedClientPath) {
    Write-Host "  ✅ Prisma client generated at: $generatedClientPath" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  WARNING: Generated client not found at expected location" -ForegroundColor Yellow
}

Write-Host ""

# Step 6: Check for schema fragmentation
Write-Host "Step 6: Checking for schema fragmentation..." -ForegroundColor Yellow

$allSchemas = Get-ChildItem -Recurse -Filter "schema.prisma" -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notlike "*node_modules*" }

Write-Host "  Found schema files:" -ForegroundColor Gray
foreach ($schema in $allSchemas) {
    if ($schema.FullName -like "*packages\db\schema.prisma*") {
        Write-Host "    ✅ $($schema.FullName) (CANONICAL)" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️  $($schema.FullName) (DUPLICATE - should be removed)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Summary
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ PRISMA CLEANUP COMPLETE" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start the dev server: pnpm dev" -ForegroundColor White
Write-Host "  2. Test Prisma: Invoke-WebRequest -Uri 'http://localhost:3000/api/debug-prisma' -Method POST" -ForegroundColor White
Write-Host ""



