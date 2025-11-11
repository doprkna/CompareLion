# Add runtime declaration to admin API routes
$adminPath = "apps\web\app\api\admin"

Get-ChildItem -Path $adminPath -Filter "route.ts" -Recurse | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    
    # Skip if already has runtime declaration
    if ($content -match 'export const runtime') {
        Write-Host "⏭️  Skipped (already has runtime): $($_.Name)" -ForegroundColor Gray
        return
    }
    
    # Skip if doesn't use prisma
    if ($content -notmatch '@/lib/db|prisma') {
        Write-Host "⏭️  Skipped (no Prisma): $($_.Name)" -ForegroundColor Gray
        return
    }
    
    # Read lines
    $lines = Get-Content $file
    
    # Find insertion point (after imports, before code)
    $insertIndex = 0
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line -match '^(import |\/\/|\/\*|\*)' -or $line.Trim() -eq '') {
            $insertIndex = $i + 1
        } else {
            break
        }
    }
    
    # Insert runtime declaration
    $newLines = @()
    $newLines += $lines[0..($insertIndex-1)]
    $newLines += ""
    $newLines += "// Force Node.js runtime for Prisma (v0.35.16d)"
    $newLines += "export const runtime = 'nodejs';"
    $newLines += $lines[$insertIndex..($lines.Count-1)]
    
    # Write back
    Set-Content -Path $file -Value $newLines
    Write-Host "✅ Updated: $($_.Name)" -ForegroundColor Green
}

Write-Host "`n✨ Done! Check files for runtime declarations." -ForegroundColor Cyan

