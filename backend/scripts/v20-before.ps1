# V-20 demo, phase 1 of 2: switch to the VULNERABLE code.
#
#   powershell -ExecutionPolicy Bypass -File scripts\v20-before.ps1
#
# Stops whatever is on port 4000, stashes the V-20 fix, verifies the vulnerable
# code is really in place, then tells you to start the server.

$repo = Split-Path -Parent $PSScriptRoot | Split-Path -Parent
$hold = Join-Path $env:TEMP "v20-bookingAccess.hold"

Write-Host ""
Write-Host "=== V-20 demo: switching to VULNERABLE code ===" -ForegroundColor Yellow
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

# 2. Stash the tracked half of the fix.
Push-Location $repo
git stash push -m "v20-demo" -- backend/controller/ChatController.js backend/route/ChatRoute.js 2>&1 |
    Where-Object { $_ -notmatch "^warning|whitespace|trailing" } | Out-Null

# 3. Move the untracked half aside (git cannot stash an untracked file).
$access = Join-Path $repo "backend\middleware\bookingAccess.js"
if (Test-Path $access) {
    Move-Item $access $hold -Force
    Write-Host "Moved bookingAccess.js aside."
}
Pop-Location

# 4. Prove the vulnerable code is actually loaded on disk.
$controller = Get-Content (Join-Path $repo "backend\controller\ChatController.js") -Raw
if ($controller -match "resolveChatIdentity") {
    Write-Host ""
    Write-Host "PROBLEM: the fix is still in ChatController.js." -ForegroundColor Red
    Write-Host "Run 'git stash list' and check the repository state before continuing." -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "VULNERABLE code is now in place." -ForegroundColor Red
Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  1. In TERMINAL 1 run:   cd '$repo\backend' ; node index.js"
Write-Host "  2. Wait for 'Server running on http://localhost:4000'"
Write-Host "  3. In TERMINAL 2 run:   powershell -ExecutionPolicy Bypass -File scripts\v20Attack.ps1"
Write-Host "  4. SCREENSHOT the red output (attacks 2, 3 and 4 succeed)"
Write-Host "  5. Ctrl+C terminal 1, then run:  scripts\v20-after.ps1"
Write-Host ""
