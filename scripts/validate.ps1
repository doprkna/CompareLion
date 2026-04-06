#!/usr/bin/env pwsh
# Big hammer: full validation chain. Fail-fast. PASS/FAIL summary.

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Resolve-Path (Join-Path $ScriptDir "..")
Set-Location $Root

$pkg = Get-Content (Join-Path $Root "package.json") -Raw | ConvertFrom-Json
$scripts = @{}
if ($pkg.scripts) {
    $pkg.scripts.PSObject.Properties | ForEach-Object { $scripts[$_.Name] = $true }
}

Write-Host "=== Validate ===" -ForegroundColor Cyan
Write-Host ("{0:yyyy-MM-dd HH:mm:ss}" -f (Get-Date))
Write-Host ""

$steps = @("check:dev-sanity", "typecheck", "test", "smoke:web", "smoke:flow")
$failStep = $null

foreach ($step in $steps) {
    if (-not $scripts.ContainsKey($step)) {
        Write-Host "[SKIP] $step (missing)" -ForegroundColor Yellow
        continue
    }
    Write-Host "[START] $step" -ForegroundColor Cyan
    & pnpm run $step
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[FAIL] $step" -ForegroundColor Red
        $failStep = $step
        break
    }
    Write-Host "[PASS] $step" -ForegroundColor Green
}

if (-not $failStep -and $env:RUN_E2E -eq "true" -and $scripts.ContainsKey("e2e:local")) {
    Write-Host "[START] e2e:local" -ForegroundColor Cyan
    & pnpm run e2e:local
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[FAIL] e2e:local" -ForegroundColor Red
        $failStep = "e2e:local"
    } else {
        Write-Host "[PASS] e2e:local" -ForegroundColor Green
    }
}

Write-Host ""
if ($failStep) {
    Write-Host "FAIL at $failStep" -ForegroundColor Red
    exit 1
} else {
    Write-Host "PASS all" -ForegroundColor Green
    exit 0
}
