# ==============================================================================
# Security Proof of Concept Script: Finding V-11 - Unrestricted File Uploads
# Target: fix-secure-file-uploads
# ==============================================================================

$BaseUrl = "http://localhost:4000"
$UploadUrl = "$BaseUrl/api/tourPackage/"

function Print-Header($title) {
    Write-Host "`n################################################################" -ForegroundColor DarkGray
    Write-Host "# $title" -ForegroundColor White
    Write-Host "################################################################`n" -ForegroundColor DarkGray
}

# Create temp attack files
$tempDir = [System.IO.Path]::GetTempPath()
$maliciousFile = Join-Path $tempDir "malicious_script.exe"
$largeFile = Join-Path $tempDir "large_payload_10mb.jpg"
$validFile = Join-Path $tempDir "valid_avatar.jpg"

"MZ90000_FAKE_EXECUTABLE_PAYLOAD" | Out-File -FilePath $maliciousFile -Encoding ascii
[byte[]]$bytes = New-Object byte[] (10 * 1024 * 1024) # 10MB payload
[System.IO.File]::WriteAllBytes($largeFile, $bytes)
[byte[]]$smallBytes = New-Object byte[] (100 * 1024)  # 100KB valid image
[System.IO.File]::WriteAllBytes($validFile, $smallBytes)

Clear-Host

# ------------------------------------------------------------------------------
# ATTACK 1: Upload a Malicious File Extension (.exe)
# ------------------------------------------------------------------------------
Print-Header "ATTACK 1 - Upload Malicious Executable (.exe) as Tour Image"

Write-Host "$ curl -F 'image=@malicious_script.exe' $UploadUrl`n" -ForegroundColor Gray

$output = & curl.exe -s -w "`n%{http_code}" -F "image=@$maliciousFile;type=application/x-msdownload" -F "packageId=PKG01" -F "name=MaliciousPackage" -F "destination=Colombo" -F "price=100" -F "startDate=2026-01-01" -F "endDate=2026-01-02" -F "tourGuideName=Hacker" -F "tourType=Adventure" -F "description=Malicious" $UploadUrl
$lines = $output -split "`n"
$statusCode = $lines[-1].Trim()
$responseBody = ($lines[0..($lines.Length - 2)] -join "`n").Trim()

if ($responseBody.Length -gt 250) {
    $preview = $responseBody.Substring(0, 250) + "..."
} else {
    $preview = $responseBody
}
Write-Host $preview -ForegroundColor White

if ($statusCode -eq "200" -or $statusCode -eq "201") {
    Write-Host "`n>>> HTTP status: $statusCode   <-- VULNERABLE: EXECUTABLE FILE ACCEPTED BY SERVER" -ForegroundColor Red
} elseif ($statusCode -eq "400" -or $statusCode -eq "500") {
    Write-Host "`n>>> HTTP status: $statusCode   <-- BLOCKED: MALICIOUS FILE TYPE REJECTED" -ForegroundColor Green
} else {
    Write-Host "`n>>> HTTP status: $statusCode   <-- RESPONSE RECEIVED" -ForegroundColor Yellow
}

# ------------------------------------------------------------------------------
# ATTACK 2: Denial of Service via Oversized File (10MB+ in Memory)
# ------------------------------------------------------------------------------
Print-Header "ATTACK 2 - DoS Memory Exhaustion Upload (10MB payload)"

Write-Host "$ curl -F 'image=@large_payload_10mb.jpg' $UploadUrl`n" -ForegroundColor Gray

$output = & curl.exe -s -w "`n%{http_code}" -F "image=@$largeFile;type=image/jpeg" -F "packageId=PKG02" -F "name=LargePackage" -F "destination=Kandy" -F "price=100" -F "startDate=2026-01-01" -F "endDate=2026-01-02" -F "tourGuideName=Hacker" -F "tourType=Adventure" -F "description=DoS" $UploadUrl
$lines = $output -split "`n"
$statusCode = $lines[-1].Trim()
$responseBody = ($lines[0..($lines.Length - 2)] -join "`n").Trim()

if ($responseBody.Length -gt 250) {
    $preview = $responseBody.Substring(0, 250) + "..."
} else {
    $preview = $responseBody
}
Write-Host $preview -ForegroundColor White

if ($statusCode -eq "200" -or $statusCode -eq "201") {
    Write-Host "`n>>> HTTP status: $statusCode   <-- VULNERABLE: 10MB FILE BUFFERED DIRECTLY INTO RAM" -ForegroundColor Red
} elseif ($statusCode -eq "400" -or $statusCode -eq "500") {
    Write-Host "`n>>> HTTP status: $statusCode   <-- BLOCKED: FILE EXCEEDS MAX SIZE LIMIT (5MB)" -ForegroundColor Green
} else {
    Write-Host "`n>>> HTTP status: $statusCode   <-- RESPONSE RECEIVED" -ForegroundColor Yellow
}

# ------------------------------------------------------------------------------
# TEST 3: Legitimate Small Image Upload
# ------------------------------------------------------------------------------
Print-Header "TEST 3 - Valid Image Upload (100KB JPEG)"

Write-Host "$ curl -F 'image=@valid_avatar.jpg' $UploadUrl`n" -ForegroundColor Gray

$rand = Get-Random -Minimum 100 -Maximum 999
$output = & curl.exe -s -w "`n%{http_code}" -F "image=@$validFile;type=image/jpeg" -F "packageId=PKG$rand" -F "name=LegitPackage" -F "destination=Galle" -F "price=100" -F "startDate=2026-01-01" -F "endDate=2026-01-02" -F "tourGuideName=Guide" -F "tourType=Cultural" -F "description=Valid" $UploadUrl
$lines = $output -split "`n"
$statusCode = $lines[-1].Trim()
$responseBody = ($lines[0..($lines.Length - 2)] -join "`n").Trim()

if ($responseBody.Length -gt 250) {
    $preview = $responseBody.Substring(0, 250) + "..."
} else {
    $preview = $responseBody
}
Write-Host $preview -ForegroundColor White

if ($statusCode -eq "200" -or $statusCode -eq "201") {
    Write-Host "`n>>> HTTP status: $statusCode   <-- SUCCESS: VALID IMAGE ACCEPTED" -ForegroundColor Green
} else {
    Write-Host "`n>>> HTTP status: $statusCode   <-- FAILED" -ForegroundColor Yellow
}

# Clean up temp files
Remove-Item $maliciousFile -ErrorAction SilentlyContinue
Remove-Item $largeFile -ErrorAction SilentlyContinue
Remove-Item $validFile -ErrorAction SilentlyContinue
Write-Host ""
