# V-20 demo, phase 2 of 2: restore the FIXED code.
#
#   powershell -ExecutionPolicy Bypass -File scripts\v20-after.ps1
#
# Stops the server, restores the V-20 fix from the stash, verifies it is really
# back, then tells you to start the server again for the "after" screenshot.

$repo = Split-Path -Parent $PSScriptRoot | Split-Path -Parent
$hold = Join-Path $env:TEMP "v20-bookingAccess.hold"

Write-Host ""
Write-Host "=== V-20 demo: restoring the FIXED code ===" -ForegroundColor Yellow
Write-Host ""

# 1. Stop any server holding port 4000.
$pids = netstat -ano | Select-String ":4000.*LISTENING" | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique
if ($pids) {
    Write-Host "Stopping server(s) on port 4000: $pids"
    $pids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 3
}

# 2. Put the untracked file back first, so the restored code can require it.
$access = Join-Path $repo "backend\middleware\bookingAccess.js"
if (Test-Path $hold) {
    Move-Item $hold $access -Force
    Write-Host "Restored bookingAccess.js."
} elseif (-not (Test-Path $access)) {
    Write-Host "PROBLEM: bookingAccess.js is missing and no held copy was found." -ForegroundColor Red
    exit 1
}

# 3. Restore the tracked half.
Push-Location $repo
git stash pop 2>&1 | Where-Object { $_ -notmatch "^warning|whitespace|trailing" } | Out-Null
Pop-Location

# 4. Prove the fix is actually back.
$controller = Get-Content (Join-Path $repo "backend\controller\ChatController.js") -Raw
if ($controller -notmatch "resolveChatIdentity") {
    Write-Host ""
    Write-Host "PROBLEM: the fix did not come back. Check 'git stash list'." -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "FIXED code is restored." -ForegroundColor Green
Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  1. In TERMINAL 1 run:   cd '$repo\backend' ; node index.js"
Write-Host "  2. In TERMINAL 2 run:   powershell -ExecutionPolicy Bypass -File scripts\v20Attack.ps1"
Write-Host "  3. SCREENSHOT the green output (every attack blocked)"
Write-Host ""
Write-Host "Afterwards, check nothing was left behind:  git stash list   (should be empty)"
Write-Host ""
