# CI Test Script
# Runs smoke tests and coverage
# v0.30.6 - Testing & Verification Recovery

param(
    [switch]$SkipCoverage = $false
)

Write-Host "ðŸ§ª Running CI Tests..." -ForegroundColor Cyan

# Change to web app directory
Push-Location apps/web

try {
    # Run tests with passWithNoTests flag
    Write-Host "`nðŸ“‹ Running smoke tests..." -ForegroundColor Yellow
    pnpm test
    
    if (-not $SkipCoverage) {
        Write-Host "`nðŸ“Š Running coverage..." -ForegroundColor Yellow
        pnpm test:coverage
    }
    
    Write-Host "`nâœ… CI Tests Complete!" -ForegroundColor Green
} catch {
    Write-Host "`nâŒ CI Tests Failed: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}