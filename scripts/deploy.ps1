#!/usr/bin/env pwsh
# Safe deploy: validate then push to Git. Vercel builds from repo.

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Resolve-Path (Join-Path $ScriptDir "..")
Set-Location $Root

$branch = git branch --show-current 2>$null
Write-Host "=== Deploy ===" -ForegroundColor Cyan
Write-Host "Branch: $branch"
Write-Host ""

Write-Host "[1/2] Running validation..." -ForegroundColor Cyan
& pnpm validate
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "DEPLOY ABORTED" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/2] Git add, commit, push..." -ForegroundColor Cyan
git add .
$status = git status --porcelain
if (-not $status) {
    Write-Host "Nothing to commit."
} else {
    $ts = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    git commit -m "Deploy: $ts"
}
git push

Write-Host ""
Write-Host "DEPLOY TRIGGERED (Vercel will build from Git)." -ForegroundColor Green
exit 0
