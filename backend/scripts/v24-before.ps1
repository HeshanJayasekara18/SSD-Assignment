# V-24 demo, phase 1 of 2: switch to the VULNERABLE code.
#
#   powershell -ExecutionPolicy Bypass -File scripts\v24-before.ps1

$repo = Split-Path -Parent $PSScriptRoot | Split-Path -Parent

Write-Host ""
Write-Host "=== V-24 demo: switching to VULNERABLE code ===" -ForegroundColor Yellow
Write-Host ""

# 1. Stop any server holding port 4000 (Ctrl+C does not always release it).
$pids = netstat -ano | Select-String ":4000.*LISTENING" | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique
if ($pids) {
    Write-Host "Stopping server(s) on port 4000: $pids"
    $pids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 3
} else {
    Write-Host "Port 4000 already free."
}

# 2. Stash the V-24 fix (routes + controllers + the ownership middleware).
Push-Location $repo
git stash push -m "v24-demo" -- `
    backend/route/VehicleRoute.js backend/route/HotelRoomRoute.js `
    backend/route/TourRoute.js backend/route/TourPackageRoute.js `
    backend/controller/VehicleController.js backend/controller/HotelRoomController.js `
    backend/controller/TourController.js backend/controller/TourPackageController.js `
    backend/middleware/bookingAccess.js 2>&1 |
    Where-Object { $_ -notmatch "^warning|whitespace|trailing" } | Out-Null
Pop-Location

# 3. Prove the vulnerable code is actually on disk.
$route = Get-Content (Join-Path $repo "backend\route\VehicleRoute.js") -Raw
if ($route -match "authorize\('Bussiness'") {
    Write-Host ""
    Write-Host "PROBLEM: the fix is still in VehicleRoute.js." -ForegroundColor Red
    Write-Host "Check 'git stash list' before continuing." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "VULNERABLE code is now in place." -ForegroundColor Red
Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  1. TERMINAL 1:  cd '$repo\backend' ; node index.js"
Write-Host "  2. TERMINAL 2:  powershell -ExecutionPolicy Bypass -File scripts\v24Attack.ps1"
Write-Host "  3. SCREENSHOT the red output (attacks succeed)"
Write-Host "  4. Ctrl+C terminal 1, then run:  scripts\v24-after.ps1"
Write-Host ""
