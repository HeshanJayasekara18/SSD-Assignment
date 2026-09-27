# ==============================================================================
# Security Proof of Concept Script: Finding V-17 - Internal Error Disclosure
# Target: fix-secure-error-handling
# ==============================================================================

$BaseUrl = "http://localhost:4000"

function Print-Header($title) {
    Write-Host "`n################################################################" -ForegroundColor DarkGray
    Write-Host "# $title" -ForegroundColor White
    Write-Host "################################################################`n" -ForegroundColor DarkGray
}

Clear-Host

# ------------------------------------------------------------------------------
# ATTACK 1: Trigger DB CastError on GET /api/tourPackage/:id
# ------------------------------------------------------------------------------
Print-Header "ATTACK 1 - Trigger DB Schema & CastError on GET /api/tourPackage/:id"

$TestUrl1 = "$BaseUrl/api/tourPackage/malformed_object_id_payload_$$$"
Write-Host "$ curl $TestUrl1`n" -ForegroundColor Gray

$output = & curl.exe -s -w "`n%{http_code}" $TestUrl1
$lines = $output -split "`n"
$statusCode = $lines[-1].Trim()
$responseBody = ($lines[0..($lines.Length - 2)] -join "`n").Trim()

Write-Host $responseBody -ForegroundColor White

if ($responseBody -match "Cast to ObjectId" -or $responseBody -match "CastError" -or $responseBody -match "type string\) at path") {
    Write-Host "`n>>> HTTP status: $statusCode   <-- VULNERABLE: MONGOOSE DRIVER INTERNALS EXPOSED" -ForegroundColor Red
} else {
    Write-Host "`n>>> HTTP status: $statusCode   <-- SAFE: INTERNAL DETAILS SANITIZED" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# ATTACK 2: Trigger Validation Error via Missing Image on POST /api/tourPackage/
# ------------------------------------------------------------------------------
Print-Header "ATTACK 2 - Trigger Missing Input Validation on POST /api/tourPackage/"

$TestUrl2 = "$BaseUrl/api/tourPackage/"
Write-Host "$ curl -X POST $TestUrl2 -d '{\"name\":\"BrokenPkg\"}'`n" -ForegroundColor Gray

$output = & curl.exe -s -w "`n%{http_code}" -X POST -H "Content-Type: application/json" -d '{"name":"BrokenPkg"}' $TestUrl2
$lines = $output -split "`n"
$statusCode = $lines[-1].Trim()
$responseBody = ($lines[0..($lines.Length - 2)] -join "`n").Trim()

Write-Host $responseBody -ForegroundColor White

if ($responseBody -match "ValidationError" -or $responseBody -match "stack" -or $responseBody -match "at path") {
    Write-Host "`n>>> HTTP status: $statusCode   <-- VULNERABLE: RAW SERVER/SCHEMA EXCEPTION LEAKED" -ForegroundColor Red
} else {
    Write-Host "`n>>> HTTP status: $statusCode   <-- SAFE: CLEAN SANITIZED VALIDATION RESPONSE" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# ATTACK 3: Trigger DB CastError on PUT /api/tourPackage/:id
# ------------------------------------------------------------------------------
Print-Header "ATTACK 3 - Trigger DB CastError on PUT /api/tourPackage/:id"

$TestUrl3 = "$BaseUrl/api/tourPackage/invalid_update_id_$$$"
Write-Host "$ curl -X PUT $TestUrl3 -d '{\"price\":-50}'`n" -ForegroundColor Gray

$output = & curl.exe -s -w "`n%{http_code}" -X PUT -H "Content-Type: application/json" -d '{"price":-50}' $TestUrl3
$lines = $output -split "`n"
$statusCode = $lines[-1].Trim()
$responseBody = ($lines[0..($lines.Length - 2)] -join "`n").Trim()

Write-Host $responseBody -ForegroundColor White

if ($responseBody -match "Cast to ObjectId" -or $responseBody -match "CastError" -or $responseBody -match "type string\) at path") {
    Write-Host "`n>>> HTTP status: $statusCode   <-- VULNERABLE: DATABASE DRIVER ERROR EXPOSED" -ForegroundColor Red
} else {
    Write-Host "`n>>> HTTP status: $statusCode   <-- SAFE: CLEAN ERROR HANDLING" -ForegroundColor Green
}

Write-Host ""
