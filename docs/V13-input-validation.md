# V-13 — Insufficient Server-Side Input Validation

**Severity:** High
**Controllers affected:** 7
**Status:** Fixed and retested
**Tests:** 34 passing

The CeylonGO API accepted whatever the browser sent it. Anyone who skipped the browser could make themselves an administrator, or set a tour package's price to zero.

---

## 1. The problem — what the vulnerability actually is

> Every form on the CeylonGO website checks what you type. The server did not check any of it again.

When you fill in the registration form, React refuses to submit until your email looks like an email and your password is long enough. That feels like protection, but it is only a convenience for honest users. The checks live in JavaScript running on *your* computer, inside *your* browser — and you can simply not use the browser.

A request to the server is just text sent over the network. Anyone can compose that text by hand. Here is the entire registration form, bypassed with one command that anybody can run:

```bash
curl -X POST http://localhost:4000/api/bussinessregister \
  -H "Content-Type: application/json" \
  -d '{"email":"attacker@evil.com", "password":"x", "role":"Admin"}'
```

No browser. No React. No validation. The server received this and — before the fix — believed every word of it.

> **The core mistake:** the frontend and the backend were each assuming the other one was doing the checking. Neither was.

---

## 2. Why it matters — two things this let an attacker do

### Anyone could make themselves an administrator

The registration code took the account type straight from the request and saved it:

```js
// backend/controller/BussinessRegisterController.js
const newUser = new User({
    email: req.body.email,
    role: req.body.role,   // ← whatever the attacker typed
});
```

The database model did not restrict the value either — `role` was declared as an ordinary piece of text, so `"Admin"` was just as acceptable as `"Tourist"`. Sending `"role":"Admin"` during signup created a real administrator account.

That one field controls everything else. Admin-only screens, the customer list, the ability to delete payment records — all of them ask "is this user an Admin?" and this let an attacker answer yes.

### Anyone could change the price of a booking

The booking update handler passed the entire request body into the database in one line:

```js
// backend/controller/BookingController.js
Booking.findOneAndUpdate({ bookingID }, req.body);
```

Whatever fields arrived got written. So an attacker could send this:

```bash
curl -X PUT http://localhost:4000/api/booking/<id> \
  -d '{"payment_amount": 0}'
```

This mattered more than it first appears. The Stripe payment code was written carefully — it deliberately reads the amount from the saved booking rather than from the customer, precisely so the customer cannot choose their own price:

```js
// backend/controller/PaymentController.js
// the charge is calculated from the trusted booking record
totalAmount: booking.payment_amount
```

But "trusted" was not true. The booking record was editable by anyone. A $349 tour could be set to $0 and then paid for, legitimately, through Stripe. The payment code did everything right and was undermined by a different file entirely.

> **Why "High" and not "Medium":** no password is needed, no existing account is needed, and nothing in the logs looks unusual. The requests are perfectly ordinary API calls. They are simply ones the website's own screens would never let you make.

---

## 3. The fix — check everything again, on the server

> Keep the frontend checks — they give users fast feedback. Add a second, independent set on the server, because that is the one an attacker cannot reach.

Three changes, in order of importance.

### One: never let the client choose its own privileges

Account type is now decided by *which endpoint was called*, not by what the request contains. The business signup route always produces a business account, because that is what that route is for:

| Before | After |
| --- | --- |
| `role: req.body.role` | `role: 'Bussiness'` |

The database model now also refuses anything outside the known list, so even a bug elsewhere in the code cannot introduce a bogus role:

```js
role: {
    type: String,
    required: true,
    enum: ['Tourist', 'Bussiness', 'TourGuide', 'Admin']
}
```

### Two: decide which fields may be written

Instead of handing the whole request to the database, the code now copies across a named list of fields and ignores everything else. Some fields may be set when a booking is created but never changed afterwards — the price is one of them:

```js
// set at creation, never editable afterwards
const BOOKING_IMMUTABLE_AFTER_CREATE = [
    'payment_amount',  // the amount Stripe charges
    'touristID',       // who owns the booking
    'B_Id', 'payID', 'tourID'
];
```

An attacker can still put `payment_amount` in the request. It is now simply dropped on the way in.

### Three: check every incoming value

A shared validation layer now sits in front of the controllers. Each route declares what it expects, and anything failing that description is rejected with a `400 Bad Request` before a single line of controller code runs:

```js
router.post('/',
    [
        emailRule('email'),
        passwordRule('password'),
        phoneRule('mobile_number'),
        requiredText('country', { max: 100 })
    ],
    validate,          // ← rejects bad input here
    Touristregister    // ← only runs on valid input
);
```

The validator does one more thing that is easy to miss and does a lot of work: after checking, it **rebuilds the request from only the fields it recognised**. Unknown fields do not reach the controller at all.

**Attacker sends:**

```json
{
  "email": "A@B.com",
  "password": "password123",
  "role": "Admin",
  "isAdmin": true,
  "userID": "stolen"
}
```

**Controller receives:**

```json
{
  "email": "a@b.com",
  "password": "password123"
}
```

Extras removed, email normalised.

### A subtle one: where the password is measured

The password rule had to move. The model said `minlength: 8`, which looks correct — but the controller hashed the password *before* saving, and a hash is always 60 characters long. The model was measuring the hash, so it passed every time. A one-character password sailed through. The check now happens on the real password, before hashing.

---

## 4. Proving it — evidence the fix works

A test script runs 34 checks against the live server and reports pass or fail:

```bash
node scripts/v13ValidationTests.js
```

Every test creates its own data and deletes it afterwards, so it can be run repeatedly. The two exploits above are included as tests — they are attempted on every run, and the run fails if either one succeeds.

| Test | Before | After |
| --- | --- | --- |
| Sign up sending `role: "Admin"` | became Admin | saved as Bussiness |
| Set a booking's price to 0 | price became 0 | price unchanged |
| Reassign a booking to another user | owner changed | owner unchanged |
| Register with a 1-character password | 201 accepted | 400 rejected |
| Register with "not-an-email" | 201 accepted | 400 rejected |
| Book a tour of type "spaceship" | 201 accepted | 400 rejected |
| Send an empty request body | 500 crash | 400 rejected |
| Read all bookings with no login | 200 OK | 401 denied |

The last row is worth singling out. The booking, chat, vehicle and hotel-room routes had no login requirement of any kind — not a weak one, none at all. Anyone who knew the address could read and change records. Those routes now require a valid token.

---

## 5. Reference — what changed, and what did not

### Files added

| File | Purpose |
| --- | --- |
| `middleware/validate.js` | Rejects bad input; strips unknown fields |
| `middleware/validators.js` | Reusable rules for email, phone, price, dates, IDs |
| `scripts/v13ValidationTests.js` | The 34-test retest suite |
| `scripts/checkUserRoles.js` | Read-only audit of stored role values |

### Bugs found along the way

Testing the fix surfaced four genuine defects that were unrelated to security but had been breaking features:

- **Business registration never worked.** The code referred to a variable named `user` that did not exist, and never actually saved the new account. Every attempt failed. It works now.
- **Fetching a tourist's details always failed** — the code read a field named `TtouristID_Id` and then searched using a different, undefined variable.
- **The chat booking list** read the business ID from the wrong place in the request.
- **The guide profile form** would have rejected every submission: the validation expected `Male` while the database and the dropdown both use `male`.

That last one is the useful lesson. It was caught only by sending a real request through the route — reading the code had not revealed it.

### Still open

> **Ownership is not yet checked.** A logged-in user can still modify another user's booking. The system now verifies that you *are* someone, but not that the record belongs to you. This is a separate authorisation finding, not part of V-13, and the test suite demonstrates it.

---

## The principle in one line

Validation that runs in the browser is a courtesy to the user. Validation that runs on the server is the only kind that is actually enforcing anything — because the server is the only part of the system an attacker does not control.
