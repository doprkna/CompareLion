#!/usr/bin/env pwsh
# Smoke test for @parel/web (Next App Router)
# One command to verify we can onboard testers today.
# No external deps; uses Invoke-WebRequest / Invoke-RestMethod.

$ErrorActionPreference = "Stop"
$Port = 3011
$BaseUrl = "http://localhost:$Port"
$HealthTimeout = 60
$RetryInterval = 2

# Ensure we run from repo root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Resolve-Path (Join-Path $ScriptDir "..")
Set-Location $Root

# Required for production build (env.ts requiredInRuntime check when NODE_ENV=production)
$env:DATABASE_URL = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { "file:./dev.db" }
$env:STRIPE_SECRET_KEY = if ($env:STRIPE_SECRET_KEY) { $env:STRIPE_SECRET_KEY } else { "sk_test_smoke_dummy" }
# Redis optional: set REDIS_DISABLED=true to run without. Do not force REDIS_URL in smoke.
if (-not $env:REDIS_URL -and $env:REDIS_DISABLED -ne "true" -and $env:REDIS_DISABLED -ne "1") {
  $env:REDIS_DISABLED = "true"
}

$Failures = @()
$PassCount = 0

function Test-Endpoint {
    param([string]$Method, [string]$Path, [hashtable]$Body = $null)
    $url = "$BaseUrl$Path"
    try {
        $params = @{
            Uri = $url
            Method = $Method
            UseBasicParsing = $true
            TimeoutSec = 10
        }
        if ($Body) {
            $params["ContentType"] = "application/json"
            $params["Body"] = ($Body | ConvertTo-Json)
        }
        $r = Invoke-WebRequest @params -ErrorAction Stop
        $code = $r.StatusCode
        if ($code -ge 500) {
            $script:Failures += "$Method $Path -> $code"
            return $false
        }
        # 401/403 OK (auth required)
        $script:PassCount++
        return $true
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($null -eq $statusCode) { $statusCode = "?" }
        # 401/403 = PASS (auth required)
        if ($statusCode -in 401, 403) {
            $script:PassCount++
            return $true
        }
        $script:Failures += "$Method $Path -> $statusCode $($_.Exception.Message)"
        return $false
    }
}

Write-Host "[1/5] Building @parel/web..." -ForegroundColor Cyan
$build = pnpm --filter @parel/web run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL Build failed" -ForegroundColor Red
    Write-Host $build
    exit 1
}
Write-Host "  OK" -ForegroundColor Green

Write-Host "[2/5] Starting server on port $Port..." -ForegroundColor Cyan
$nextPath = Join-Path $Root "node_modules\next\dist\bin\next"
$webDir = Join-Path $Root "apps\web"
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "node"
$psi.Arguments = "`"$nextPath`" start -p $Port"
$psi.WorkingDirectory = $webDir
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true
$proc = [System.Diagnostics.Process]::Start($psi)
if (-not $proc) {
    Write-Host "FAIL Could not start server" -ForegroundColor Red
    exit 1
}
try {
    Write-Host "[3/5] Waiting for /api/health (timeout ${HealthTimeout}s)..." -ForegroundColor Cyan
    $elapsed = 0
    $ok = $false
    while ($elapsed -lt $HealthTimeout) {
        try {
            $r = Invoke-WebRequest -Uri "$BaseUrl/api/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($r.StatusCode -eq 200) {
                $ok = $true
                break
            }
        } catch {}
        Start-Sleep -Seconds $RetryInterval
        $elapsed += $RetryInterval
    }
    if (-not $ok) {
        Write-Host "FAIL /api/health did not return 200 within ${HealthTimeout}s" -ForegroundColor Red
        $proc.Kill()
        exit 1
    }
    Write-Host "  OK" -ForegroundColor Green

    Write-Host "[4/5] Checking endpoints..." -ForegroundColor Cyan
    $null = Test-Endpoint -Method GET -Path "/api/health"
    $null = Test-Endpoint -Method GET -Path "/api/init"
    $null = Test-Endpoint -Method POST -Path "/api/flow/start" -Body @{ categoryId = "smoke-test" }
    $null = Test-Endpoint -Method GET -Path "/api/rpg/status"
} finally {
    Write-Host "[5/5] Stopping server..." -ForegroundColor Cyan
    try {
        if (-not $proc.HasExited) {
            $proc.Kill()
        }
    } catch {}
    Write-Host "  OK" -ForegroundColor Green
}

Write-Host ""
if ($Failures.Count -eq 0) {
    Write-Host "PASS (4/4 endpoints non-500)" -ForegroundColor Green
    exit 0
} else {
    Write-Host "FAIL" -ForegroundColor Red
    foreach ($f in $Failures) { Write-Host "  $f" -ForegroundColor Red }
    exit 1
}
