#!/usr/bin/env pwsh
# Kill process(es) owning a TCP port.
# Usage: .\kill-port.ps1 -Port 3001

param([int]$Port)

$conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if (-not $conns) {
    Write-Host "No process on port $Port"
    exit 0
}

$procIds = $conns.OwningProcess | Sort-Object -Unique
foreach ($procId in $procIds) {
    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
    $name = if ($proc) { $proc.ProcessName } else { "?" }
    Write-Host "Stopping PID $procId ($name)"
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}
Write-Host "Done"
