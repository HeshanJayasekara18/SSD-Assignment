# V-24 demo, phase 2 of 2: restore the FIXED code.
#
#   powershell -ExecutionPolicy Bypass -File scripts\v24-after.ps1

$repo = Split-Path -Parent $PSScriptRoot | Split-Path -Parent

Write-Host ""
Write-Host "=== V-24 demo: restoring the FIXED code ===" -ForegroundColor Yellow
Write-Host ""

$pids = netstat -ano | Select-String ":4000.*LISTENING" | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique
if ($pids) {
    Write-Host "Stopping server(s) on port 4000: $pids"
    $pids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 3
}

Push-Location $repo
git stash pop 2>&1 | Where-Object { $_ -notmatch "^warning|whitespace|trailing" } | Out-Null
Pop-Location

$route = Get-Content (Join-Path $repo "backend\route\VehicleRoute.js") -Raw
if ($route -notmatch "authorize\('Bussiness'") {
    Write-Host ""
    Write-Host "PROBLEM: the fix did not come back. Check 'git stash list'." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "FIXED code is restored." -ForegroundColor Green
Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  1. TERMINAL 1:  cd '$repo\backend' ; node index.js"
Write-Host "  2. TERMINAL 2:  powershell -ExecutionPolicy Bypass -File scripts\v24Attack.ps1"
Write-Host "  3. SCREENSHOT the green output (every attack blocked)"
Write-Host ""
Write-Host "Afterwards check:  git stash list   (should be empty)"
Write-Host ""
