# Security Fixes — CeylonGO

Three vulnerabilities found during the security assessment, and how each was
fixed. Each section explains what the problem was, which endpoints were
affected, why it mattered, and what changed.

| # | Vulnerability | Severity | Status |
| --- | --- | --- | --- |
| 1 | Raw card details stored in the database | Critical | Fixed |
| 2 | Insufficient server-side input validation (V-13) | High | Fixed, 34 tests |
| 3 | Unauthenticated chat access and sender spoofing (V-20) | High | Fixed, 13 tests |

---

# 1. Raw Card Details Stored in the Database

## What the vulnerability was

The payment forms asked customers to type their card number, expiry date and
CVV directly into the CeylonGO website. Those values were sent to our own server
and saved into MongoDB as ordinary text.

The database models declared them as plain required strings:

```js
// backend/model/CustomizePayment.js — BEFORE
cardNumber: { type: String, required: true },
expiryDate: { type: String, required: true },
cvv:        { type: String, required: true }
```

The same three fields existed on the `Payment` model. Anyone who could read the
database — a developer, a backup file, an attacker who got in through any other
weakness — could read every customer's full card details in plain text.

## Affected endpoints

| Endpoint | What it did |
| --- | --- |
| `POST /api/payment/process` | Took card number, expiry and CVV in the request body |
| `POST /api/customizepayment` | Same, for custom tour bookings |
| `PaymentManagement.js` (admin screen) | Displayed stored card data back to admin users |

## Why it was a serious risk

**It breaks the card industry's rules.** PCI-DSS Requirement 3.2 states that the
CVV must never be stored after a transaction is authorised — not encrypted, not
hashed, not at all. Storing the full card number carries strict encryption and
audit obligations that a student project cannot meet. Storing the CVV alongside
the card number is the specific combination the rule exists to prevent, because
together they are enough to make purchases on other websites.

**One breach exposes everything.** Card details are unlike passwords: a password
can be reset, but a stolen card number is directly usable for fraud until the
customer notices and cancels the card. Because the data was plain text, an
attacker would not even need to crack anything.

**It made every other vulnerability worse.** Any flaw giving read access to the
database — NoSQL injection, a leaked connection string, an over-permissive admin
route — would have handed over card data as well. It turned minor bugs into
serious incidents.

## How it was fixed

**Card data never reaches our server.** The application now uses **Stripe
Checkout**. The customer is redirected to a payment page hosted by Stripe,
enters their card there, and returns afterwards. Our server never sees the card
number, expiry or CVV, so it cannot store or leak them.

```js
// backend/controller/PaymentController.js — AFTER
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{ price_data: { currency, unit_amount: toStripeAmount(payment.totalAmount) }, quantity: 1 }],
  success_url: `${getFrontendUrl()}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url:  `${getFrontendUrl()}/payment-cancelled`
});
```

**The card input fields were deleted from the frontend.** `MajorPayment.js` and
`PackagePayment.js` lost roughly 400 lines between them — the card form, its
validation and its state. The customer now sees a "Pay with Stripe" button.

**The old raw-card endpoints were disabled** rather than left in place:

```js
// backend/controller/PaymentController.js
message: 'Raw card processing has been removed. Use /api/payment/create-checkout-session.'
```

**Only safe identifiers are stored now.** The models keep just enough to display
a receipt and reconcile with Stripe:

```js
cardBrand: { type: String, default: '' },   // "visa"
cardLast4: { type: String, default: '' },   // "4242"
stripeSessionId:       { type: String, index: true },
stripePaymentIntentId: { type: String, index: true }
```

The last four digits and the brand are explicitly permitted by PCI-DSS, because
they cannot be used to make a payment.

**Payment status comes only from Stripe.** A signed webhook updates the record,
so a customer cannot mark their own payment as complete:

```js
// Security: only Stripe-signed webhook events may update payment status.
event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
```

**Existing card data was purged.** `backend/scripts/purgeCardData.js` removes the
old fields from documents already in the database — the fix is not complete
until the historical data is gone:

```bash
node scripts/purgeCardData.js
```

**The amount is taken from the server, not the browser.** The charge is computed
from the stored booking or package price, so a customer cannot choose what to
pay:

```js
// Security: the charge amount is calculated from the trusted booking record,
// not client input.
totalAmount: booking.payment_amount
```

---

# 2. Insufficient Server-Side Input Validation (V-13)

## What the vulnerability was

Every form on the website checked what the user typed — but the server did not
check any of it again.

Those checks ran in JavaScript, in the user's own browser. A request to the
server is just text sent over the network, and anyone can compose that text by
hand. The entire registration form could be bypassed with one command:

```bash
curl -X POST http://localhost:4000/api/bussinessregister \
  -H "Content-Type: application/json" \
  -d '{"email":"attacker@evil.com","password":"x","role":"Admin"}'
```

No browser, no React, no validation. The frontend and the backend were each
assuming the other was doing the checking. Neither was.

## Affected endpoints

| Endpoint | Problem |
| --- | --- |
| `POST /api/touristregister` | No format, length or presence checks |
| `POST /api/bussinessregister` | Took the account `role` straight from the request body |
| `POST /api/Booking` | `Booking.create(req.body)` — every field writable |
| `PUT /api/Booking/:id` | Whole request body passed into the update; **no login required** |
| `GET /api/Booking` | **No login required** |
| `POST /api/chat` | No login required |
| `POST /api/vehicle`, `PUT /api/vehicle/:id` | No login; `{...req.body}` spread into the update |
| `POST /api/hotelroom`, `PUT /api/hotelroom/:id` | Same |
| `POST /api/GuideDetails/profile` | No validation of age, gender, phone or amount |

## Why it was a serious risk

**Anyone could become an administrator.** The `role` field was read from the
request and saved unchanged, and the `User` model accepted any text:

```js
// backend/controller/BussinessRegisterController.js — BEFORE
role: req.body.role,   // ← whatever the attacker typed
```

Sending `"role":"Admin"` during signup created a real admin account, unlocking
every admin-only screen and route.

**Anyone could set a booking's price to zero.** The update handler passed the
whole body to the database:

```js
// backend/controller/BookingController.js — BEFORE
Booking.findOneAndUpdate({ bookingID }, req.body);
```

This undermined the payment fix described above. The Stripe code deliberately
reads the amount from the stored booking so the customer cannot choose their own
price — but the stored booking was editable by anyone, with no login:

```bash
curl -X PUT http://localhost:4000/api/booking/<id> -d '{"payment_amount":0}'
```

A $349 tour could be set to $0 and then paid, legitimately, through Stripe.

**The password rule was measuring the wrong thing.** The model said
`minlength: 8`, but the controller hashed the password *before* saving, and a
bcrypt hash is always 60 characters. The model was checking the hash, so a
one-character password always passed.

**Several routes had no authentication at all.** Booking, chat, vehicle and
hotel-room endpoints could be read and written by anyone who knew the address.

## How it was fixed

**A central validation layer** now sits in front of the controllers. Each route
declares what it expects; anything failing is rejected with `400 Bad Request`
before any controller code runs:

```js
// backend/route/TouristRegistration.js
router.post('/',
  [ emailRule('email'), passwordRule('password'),
    phoneRule('mobile_number'), requiredText('country', { max: 100 }) ],
  validate,          // ← rejects bad input here
  Touristregister    // ← only runs on valid input
);
```

**Unknown fields are stripped before the controller sees them.** After checking,
`validate` rebuilds the request from only the fields that were declared:

```js
// backend/middleware/validate.js
const body = matchedData(req, { locations: ['body'], includeOptionals: false });
req.body = body;
```

| Attacker sends | Controller receives |
| --- | --- |
| `email`, `password`, `role: "Admin"`, `isAdmin: true`, `userID: "stolen"` | `email` (normalised), `password` |

**Privileges are never taken from the request.** The role is decided by which
endpoint was called, and the model restricts the possible values:

```js
role: 'Bussiness'                                        // controller
role: { type: String, required: true,
        enum: ['Tourist','Bussiness','TourGuide','Admin'] }  // model
```

**Writable fields are listed explicitly,** and some are immutable after
creation:

```js
// backend/controller/BookingController.js
const BOOKING_IMMUTABLE_AFTER_CREATE = [
  'payment_amount',  // the amount Stripe charges
  'touristID',       // who owns the booking
  'B_Id', 'payID', 'tourID'
];
```

**Passwords are checked before hashing,** on the real password rather than the
hash.

**Authentication was added** to the booking, chat, vehicle, hotel-room and
guide-profile routes that previously had none.

## Evidence

```bash
node scripts/v13ValidationTests.js     # 34 passed, 0 failed
```

| Test | Before | After |
| --- | --- | --- |
| Sign up sending `role: "Admin"` | became Admin | saved as Bussiness |
| Set a booking's price to 0 | price became 0 | price unchanged |
| Reassign a booking to another user | owner changed | owner unchanged |
| Register with a 1-character password | 201 accepted | 400 rejected |
| Register with `"not-an-email"` | 201 accepted | 400 rejected |
| Book a tour of type `"spaceship"` | 201 accepted | 400 rejected |
| Send an empty request body | 500 crash | 400 rejected |
| Read all bookings with no login | 200 OK | 401 denied |

---

# 3. Unauthenticated Chat Access and Sender Spoofing (V-20)

## What the vulnerability was

The chat feature let tourists message the hotel or tour operator about their
booking. The server decided *who was speaking* by reading it from the request:

```js
// backend/controller/ChatController.js — BEFORE
const { sender, senderModel, bookingId, message } = req.body;
const chat = new Chat({ sender, senderModel, bookingId, message });
```

Whoever sent the request chose their own name badge. Reading was no better — it
filtered on a `userId` supplied in the query string, so anyone could read any
conversation by passing someone else's identifier.

Nothing checked whether the caller was actually part of the booking being
discussed.

## Affected endpoints

| Endpoint | Problem |
| --- | --- |
| `POST /api/chat` | `sender` and `senderModel` taken from the request body |
| `GET /api/chat` | Filtered by a client-supplied `userId`; no participant check |
| `POST /api/chat/bookingByBussinessId` | Returned any business's bookings for a supplied `B_Id` |

## Why it was a serious risk

**Private conversations could be read by anyone.** Supplying another customer's
booking ID and user ID returned their whole conversation:

```
GET /api/chat?bookingId=<victim's booking>&userId=<victim's id>&senderModel=Tourist

{"chats":[{"message":"private message from Bob - my passport number is X1234567"}]}
```

**Messages could be planted in someone else's conversation, under a false
name.** This is the dangerous one, because it enables convincing fraud. An
attacker could post into a stranger's booking chat while appearing to be the
hotel:

```bash
curl -X POST http://localhost:4000/api/chat \
  -d '{"sender":"<victim id>","senderModel":"Business",
       "bookingId":"<victim booking>",
       "message":"Your tour is cancelled. Send payment to this account instead."}'
```

The victim sees an official-looking message from the business they booked with,
inside the app they trust. That is a far more effective scam than a phishing
email, because it arrives through a legitimate channel.

**Any user could impersonate staff.** Setting `senderModel: "Business"` made a
tourist's messages display as if sent by the hotel — enough to ask another
customer to "confirm your card number".

## How it was fixed

**Identity comes from the login token, never from the request.** A helper
resolves who the caller actually is:

```js
// backend/middleware/bookingAccess.js
// tourist:  JWT.userID -> Tourist.userID       -> touristID
// business: JWT.userID -> BussinessAgent.userID -> BA_Id -> Bussiness.B_Id
const resolveChatIdentity = async (user) => { ... }
```

```js
// backend/controller/ChatController.js — AFTER
const identity = await resolveChatIdentity(req.user);
const chat = new Chat({
  sender: identity.senderId,        // from the token
  senderModel: identity.senderModel // from the token
  , bookingId, message
});
```

**Participation is verified before any read or write.** A booking has exactly
two parties, and the caller must be one of them:

```js
const access = await assertBookingParticipant(identity, bookingId, req.user);
if (!access.ok) return res.status(access.status).json({ message: access.message });
```

**The identity fields are no longer accepted at all.** `sender`, `senderModel`
and `userId` were removed from the route definitions, so `validate` strips them
before the controller runs — a forged value cannot reach the database even by
accident.

**Reading returns the whole conversation for a booking you belong to,** rather
than filtering on a value the caller supplies.

**The business endpoint derives its own `B_Id`** from the authenticated account
instead of trusting the request.

**The frontend was updated to match** — it now sends an `Authorization: Bearer`
header and no longer sends identity fields, since the server ignores them.

## Evidence

```bash
node scripts/v20ChatTests.js     # 13 passed, 0 failed
```

Two real accounts, Alice and Bob, each with a private booking:

| Test | Before | After |
| --- | --- | --- |
| Read a conversation with no login | — | 401 |
| Alice reads Bob's conversation | **200 — passport number leaked** | 403 |
| Alice writes into Bob's conversation | **201 — fake message planted** | 403 |
| Alice posts as `senderModel: "Business"` | **stored as Business** | stored as `Tourist` |
| Alice forges `sender` as Bob's ID | **stored as Bob** | stored as Alice's real ID |
| Alice uses her own conversation | 201 | 201 (still works) |

---

# Summary

| Vulnerability | Root cause | Fix |
| --- | --- | --- |
| Raw card storage | We handled card data ourselves | Stripe Checkout; we never see the card |
| Input validation (V-13) | Trusting the browser's checks | Server-side validation; unknown fields stripped |
| Chat spoofing (V-20) | Trusting the request's claim of identity | Identity from the login token; participation verified |

All three share one root cause: **trusting data that the client controls.** The
browser, the request body and the query string are all attacker-controlled. Only
the server, the login token it issued, and the records already in its database
can be trusted.

## Known remaining issues

- **Ownership checks are incomplete outside chat.** A logged-in user can still
  modify another user's booking. The V-13 test suite demonstrates this rather
  than hiding it. This is a separate authorisation finding.
- **Vulnerable dependencies.** `npm audit` reports 17 backend and 29 frontend
  advisories, including a critical one in jsPDF. See
  `docs/V14-vulnerable-dependencies.md`.
