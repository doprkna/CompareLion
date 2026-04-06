#!/usr/bin/env pwsh
# Start dev server. Optional: kill port 3001 first (best-effort).

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Resolve-Path (Join-Path $ScriptDir "..")
Set-Location $Root

# Best-effort kill (ignore failure)
try {
    & powershell -ExecutionPolicy Bypass -File (Join-Path $ScriptDir "kill-port.ps1") -Port 3001 2>$null
} catch {}

# Start dev
& pnpm dev
