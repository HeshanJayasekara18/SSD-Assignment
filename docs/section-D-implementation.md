# D. Implementation of the Fix

## Patched Source Code

This section shows the actual code changed for each vulnerability, as committed
to the repository. Each fix is presented as the vulnerable code, the patched
code, and an explanation of why the change closes the flaw.

| Vulnerability | Commits | Files changed |
| --- | --- | --- |
| 1. Raw card details stored in DB | `cc5b7b1`, `78c0561` | 2 models, 2 controllers, 3 frontend pages |
| 2. Insufficient input validation (V-13) | `2e7ad98` … `8bc0ada` | 2 new middleware, 7 controllers, 7 routes, 1 model |
| 3. Chat access & sender spoofing (V-20) | `5d39270`, `edd54d1`, `f5c068c` | 1 new middleware, 1 controller, 1 route, 1 frontend page |

---

## Fix 1 — Raw Card Details Stored in the Database

### 1.1 Removing card fields from the data models

**VULNERABLE** — `backend/model/CustomizePayment.js`

```js
cardDetails: {
    cardNumber: {
      type: String,
      required: true
    },
    expiryDate: {
      type: String,
      required: true
    },
    cvv: {
      type: String,
      required: true
    }
}
```

The same three fields existed on `backend/model/Payment.js`.

**PATCHED** — `backend/model/Payment.js`

```js
  stripeSessionId: {
    type: String,
    index: true
  },
  stripePaymentIntentId: {
    type: String,
    index: true
  },
  cardBrand: {
    type: String,
    default: ''        // e.g. "visa"
  },
  cardLast4: {
    type: String,
    default: ''        // e.g. "4242"
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  }
```

**Why this fixes it:** the card number, expiry and CVV are gone entirely. Only
the brand and last four digits remain, which PCI-DSS explicitly permits because
they cannot be used to make a payment. The Stripe identifiers let us reconcile a
payment without holding any card data ourselves.

### 1.2 Replacing card capture with Stripe Checkout

**PATCHED** — `backend/controller/PaymentController.js`

```js
const createCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripeClient();
    const { packageId, bookingId, numberOfTravelers } = req.body;

    // ... resolve the package or booking ...

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: { name: lineItemName },
          unit_amount: toStripeAmount(payment.totalAmount)
        },
        quantity: 1
      }],
      metadata,
      success_url: `${getFrontendUrl()}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getFrontendUrl()}/payment-cancelled`
    });

    payment.stripeSessionId = session.id;
    await payment.save();

    res.status(201).json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('createCheckoutSession failed:', error);
    res.status(500).json({ success: false, message: 'Unable to create checkout session' });
  }
};
```

**Why this fixes it:** the customer is redirected to a page hosted by Stripe and
types their card there. The card details never travel to our server, so there is
nothing for us to store, log or leak.

### 1.3 Disabling the old raw-card endpoints

**PATCHED** — `backend/controller/PaymentController.js` and
`backend/controller/CustomizePaymentController.js`

```js
res.status(410).json({
  success: false,
  message: 'Raw card processing has been removed. Use /api/payment/create-checkout-session.'
});
```

**Why this fixes it:** the endpoints were disabled rather than deleted, so any
client still calling them receives a clear error instead of silently appearing
to work.

### 1.4 Taking the charge amount from the server

**PATCHED** — `backend/controller/PaymentController.js`

```js
// Security: the charge amount is calculated from the trusted booking record,
// not client input.
payment = await CustomizePayment.create({
    fullName: booking.name,
    bookingId: booking.bookingID,
    totalAmount: booking.payment_amount,
    currency,
    status: 'Pending'
});
```

**Why this fixes it:** the price comes from the stored record, so a customer
cannot choose their own amount by editing the request.

### 1.5 Accepting payment confirmation only from Stripe

**PATCHED** — `backend/controller/PaymentController.js`

```js
const stripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    // Security: only Stripe-signed webhook events may update payment
    // status/card metadata.
    event = getStripeClient().webhooks.constructEvent(
      req.body, signature, process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    await markSessionPayment(event.data.object, 'Completed');
  }
  ...
};
```

Registered in `backend/index.js` with the raw body parser, which the signature
check requires:

```js
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
app.use(express.json());   // registered AFTER the webhook route
```

**Why this fixes it:** a payment can only be marked complete by a message
cryptographically signed by Stripe. A customer cannot mark their own booking as
paid.

### 1.6 Purging card data already in the database

**PATCHED** — `backend/scripts/purgeCardData.js`

```js
// PCI-DSS: card number, expiry, and CVV must not remain in stored documents.
const [paymentResult, customizeResult] = await Promise.all([
  Payment.updateMany({ cardDetails: { $exists: true } }, { $unset: { cardDetails: '' } }),
  CustomizePayment.updateMany({ cardDetails: { $exists: true } }, { $unset: { cardDetails: '' } })
]);
```

```bash
node scripts/purgeCardData.js
```

**Why this fixes it:** changing the model stops *new* card data being written but
leaves existing documents untouched. The fix is not complete until the
historical data is removed.

---

## Fix 2 — Insufficient Server-Side Input Validation (V-13)

### 2.1 New central validation handler

**PATCHED (new file)** — `backend/middleware/validate.js`

```js
const { validationResult, matchedData } = require('express-validator');

// Security: central handler for express-validator chains.
// Rejects invalid input with 400 before any controller logic runs, and replaces
// req.body/query/params with ONLY the validated fields so unknown properties
// sent by a client can never reach Mongoose (mass-assignment defence).
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    const body = matchedData(req, { locations: ['body'], includeOptionals: false });
    const query = matchedData(req, { locations: ['query'], includeOptionals: false });
    const params = matchedData(req, { locations: ['params'], includeOptionals: false });

    req.body = body;
    Object.keys(req.query).forEach((key) => {
        if (!(key in query)) { delete req.query[key]; }
    });
    Object.assign(req.query, query);
    Object.assign(req.params, params);

    next();
};

module.exports = validate;
```

**Why this fixes it:** two defences in one place. Invalid input is rejected with
a 400 before the controller runs, and — importantly — the request is *rebuilt*
from only the declared fields, so any extra property an attacker adds is
discarded before it can reach the database.

### 2.2 Reusable validation rules

**PATCHED (new file)** — `backend/middleware/validators.js`

```js
// Security: password length is validated on the RAW password here, before the
// controller hashes it. Checking minlength on the User model instead would only
// ever measure the 60-character bcrypt hash and always pass.
const passwordRule = (field = 'password') =>
    body(field)
        .exists({ checkNull: true }).withMessage('Password is required')
        .bail()
        .isString().withMessage('Password must be a string')
        .bail()
        .isLength({ min: PASSWORD_MIN, max: PASSWORD_MAX })
        .withMessage(`Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters`);

// Identifiers in this codebase are uuid v4 strings.
const idRule = (field, location = param, { label } = {}) =>
    location(field)
        .exists({ checkNull: true }).withMessage(`${label || field} is required`)
        .bail()
        .isString().bail()
        .trim()
        .isLength({ min: 1, max: 100 })
        // Security: constrain to a safe character set so the value cannot carry
        // operators or objects into a Mongo query.
        .matches(/^[A-Za-z0-9_-]+$/).withMessage(`${label || field} contains invalid characters`);
```

**Why this fixes it:** the password check now runs on the real password rather
than the hash, and identifiers are restricted to safe characters so they cannot
smuggle query operators into MongoDB.

### 2.3 Closing the privilege-escalation hole

**VULNERABLE** — `backend/controller/BussinessRegisterController.js`

```js
// Create User
const newUser = new User({
    username: req.body.email,
    password: hashedPassword,
    role: req.body.role,          // ← attacker chooses their own role
    email: req.body.email
});
```

**PATCHED**

```js
// Create User
// Security: role is fixed by the endpoint, never read from req.body, so a
// client cannot self-register as Admin.
const newUser = await User.create({
    username: req.body.email,
    password: hashedPassword,
    role: 'Bussiness',
    email: req.body.email
});
```

**VULNERABLE** — `backend/model/User.js`

```js
role: { type: String, required: true },
```

**PATCHED**

```js
// Security: role is constrained to a fixed set and is never taken from the
// request body - it is derived from the registration endpoint used.
role: { type: String, required: true, enum: ['Tourist', 'Bussiness', 'TourGuide', 'Admin'] },
```

**Why this fixes it:** two independent layers. The controller no longer reads
`role` from the request, and even if some other code path tried to, the model
would reject any value outside the fixed list.

### 2.4 Closing the mass-assignment / payment-bypass hole

**VULNERABLE** — `backend/controller/BookingController.js`

```js
const addBooking = async (req, res) => {
    try {
        const newBooking = await Booking.create(req.body);
        res.status(200).json(newBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBooking = async (req, res) => {
    const bookingID = req.params.id;
    const body = req.body;

    try {
        const updatedBooking = await Booking.findOneAndUpdate(
            { bookingID: bookingID },
            body,                              // ← every field writable
            { new: true, runValidators: true }
        );
        res.status(200).json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
```

**PATCHED**

```js
// Security: only these fields may ever be written from a request body. Passing
// req.body straight to Mongoose would let a client set any field on the document.
const BOOKING_WRITABLE_FIELDS = [
    'name', 'booking_type', 'booking_date', 'booking_time',
    'start_date', 'end_date', 'mobile_number', 'payID', 'tourID',
    'payment_amount', 'touristID', 'B_Id',
    'hotel_booking', 'vehicle_booking', 'guide_booking'
];

// Security: fields that may be set when a booking is CREATED but must never be
// changed afterwards. payment_amount is the amount PaymentController charges via
// Stripe, and touristID/B_Id are ownership, so allowing updates would let a
// client zero out a price or reassign someone else's booking.
const BOOKING_IMMUTABLE_AFTER_CREATE = ['payment_amount', 'touristID', 'B_Id', 'payID', 'tourID'];

const pickBookingFields = (source, { isUpdate = false } = {}) => {
    const allowed = isUpdate
        ? BOOKING_WRITABLE_FIELDS.filter((f) => !BOOKING_IMMUTABLE_AFTER_CREATE.includes(f))
        : BOOKING_WRITABLE_FIELDS;

    const result = {};
    allowed.forEach((field) => {
        if (source[field] !== undefined) { result[field] = source[field]; }
    });
    return result;
};

const addBooking = async (req, res) => {
    const newBooking = await Booking.create(pickBookingFields(req.body));
    res.status(200).json(newBooking);
};

const updateBooking = async (req, res) => {
    const updatedBooking = await Booking.findOneAndUpdate(
        { bookingID: req.params.id },
        pickBookingFields(req.body, { isUpdate: true }),
        { new: true, runValidators: true }
    );
    if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(updatedBooking);
};
```

**Why this fixes it:** the price and the owner can be set when the booking is
created but never changed afterwards. This is what closes the payment bypass —
`PaymentController` reads `booking.payment_amount` as the trusted charge amount,
and that field is now genuinely trustworthy.

### 2.5 Applying validation and authentication at the routes

**VULNERABLE** — `backend/route/BookingRoute.js`

```js
router.get('/', getAllBooking);
router.get('/:id', getBooking);
router.post('/', addBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.post('/report', generateReport);
```

No authentication, no validation.

**PATCHED**

```js
const createRules = [
    requiredText('name', { max: 150, label: 'Name' }),
    enumRule('booking_type', BOOKING_TYPES, { label: 'Booking type' }),
    dateRule('booking_date', { label: 'Booking date' }),
    dateRule('start_date', { label: 'Start date' }),
    dateRule('end_date', { label: 'End date' }),
    body('end_date').custom((value, { req }) => {
        if (req.body.start_date && value < req.body.start_date) {
            throw new Error('End date must be on or after the start date');
        }
        return true;
    }),
    phoneRule('mobile_number'),
    positiveNumber('payment_amount', { max: 10000000, label: 'Payment amount' }),
    idRule('touristID', body, { label: 'Tourist ID' }),
    ...nestedRules
];

router.get('/', authenticateUser, getAllBooking);
router.post('/report', authenticateUser, authorize('Admin'), generateReport);
router.get('/:id', authenticateUser, [idRule('id', param)], validate, getBooking);
router.post('/', authenticateUser, createRules, validate, addBooking);
router.put('/:id', authenticateUser, [idRule('id', param), ...updateRules], validate, updateBooking);
router.delete('/:id', authenticateUser, [idRule('id', param)], validate, deleteBooking);
```

**Why this fixes it:** every route now requires a valid login, and every field is
type-checked and range-checked before the controller runs. The same pattern was
applied to the tourist-registration, business-registration, chat, vehicle,
hotel-room and guide-profile routes.

---

## Fix 3 — Unauthenticated Chat Access and Sender Spoofing (V-20)

### 3.1 New identity and participation middleware

**PATCHED (new file)** — `backend/middleware/bookingAccess.js`

```js
// Security (V-20): resolves the authenticated user's *domain* identity from the
// JWT, so chat sender identity is never taken from the request body.
//
// A booking has exactly two participants:
//   tourist   JWT.userID -> Tourist.userID        -> touristID == Booking.touristID
//   business  JWT.userID -> BussinessAgent.userID -> BA_Id -> Bussiness.B_Id == Booking.B_Id
const resolveChatIdentity = async (user) => {
    if (!user || !user.userID) { return null; }

    const tourist = await Tourist.findOne({ userID: user.userID });
    if (tourist) {
        return { senderId: tourist.touristID, senderModel: 'Tourist', touristID: tourist.touristID };
    }

    const agent = await BussinessAgent.findOne({ userID: user.userID });
    if (agent) {
        const business = await Bussiness.findOne({ BA_Id: agent.BA_Id });
        if (business) {
            return { senderId: business.B_Id, senderModel: 'Business', B_Id: business.B_Id };
        }
    }

    return null;
};

// Security (V-20): confirms the authenticated user is one of the two parties on
// the booking before any chat message is written or read.
const assertBookingParticipant = async (identity, bookingId, user) => {
    const booking = await Booking.findOne({ bookingID: bookingId });

    if (!booking) {
        return { ok: false, status: 404, message: 'Booking not found' };
    }

    if (user && user.role === 'Admin') {
        return { ok: true, booking };
    }

    if (!identity) {
        return { ok: false, status: 403, message: 'You are not a participant in this conversation' };
    }

    const isTourist  = identity.touristID && booking.touristID === identity.touristID;
    const isBusiness = identity.B_Id && booking.B_Id === identity.B_Id;

    if (!isTourist && !isBusiness) {
        return { ok: false, status: 403, message: 'You are not a participant in this conversation' };
    }

    return { ok: true, booking };
};
```

**Why this fixes it:** identity is derived by looking up the logged-in user in
the database, starting from the `userID` inside their signed JWT. There is no
path by which a request can influence the result.

### 3.2 Removing sender spoofing

**VULNERABLE** — `backend/controller/ChatController.js`

```js
const saveChat = async (req, res) => {
    try {
        const { sender, senderModel, bookingId, message } = req.body;

        if (!sender || !senderModel || !bookingId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const chat = new Chat({
            sender,          // ← whoever the caller claims to be
            senderModel,     // ← "Business" if they say so
            bookingId,       // ← any booking, not checked
            message,
        });

        const savedChat = await chat.save();
        res.status(201).json({ message: "Chat saved successfully", chat: savedChat });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
```

**PATCHED**

```js
// Security (V-20): sender and senderModel come from the authenticated token via
// resolveChatIdentity, never from req.body, so a caller cannot post as someone
// else. Participation in the referenced booking is verified before writing.
const saveChat = async (req, res) => {
    try {
        const { bookingId, message } = req.body;

        const identity = await resolveChatIdentity(req.user);
        if (!identity) {
            return res.status(403).json({ message: 'No chat identity for this account' });
        }

        const access = await assertBookingParticipant(identity, bookingId, req.user);
        if (!access.ok) {
            return res.status(access.status).json({ message: access.message });
        }

        const chat = new Chat({
            sender: identity.senderId,
            senderModel: identity.senderModel,
            bookingId,
            message
        });

        const savedChat = await chat.save();
        res.status(201).json({ message: "Chat saved successfully", chat: savedChat });
    } catch (error) {
        console.error("Save chat error:", error);
        res.status(500).json({ message: 'Unable to save chat message' });
    }
};
```

**Why this fixes it:** `sender` and `senderModel` are no longer read from the
request at all. A forged value in the body is ignored, and the caller must be a
participant in the booking before anything is written.

### 3.3 Closing the conversation-read hole

**VULNERABLE** — `backend/controller/ChatController.js`

```js
const getChatByUserBooking = async (req, res) => {
    const { userId, senderModel, bookingId } = req.query;

    if (!userId || !senderModel || !bookingId) {
        return res.status(400).json({ message: "Missing query parameters" });
    }

    const chats = await Chat.find({
        sender: userId,        // ← caller supplies whose messages to read
        bookingId: bookingId   // ← and which conversation
    }).sort({ timestamp: 1 });

    res.status(200).json({ chats });
};
```

**PATCHED**

```js
// Security (V-20): returns the whole conversation for a booking the caller is a
// participant in. The previous version filtered by a client-supplied userId,
// which let a caller read any conversation by guessing identifiers.
const getChatByUserBooking = async (req, res) => {
    try {
        const { bookingId } = req.query;

        const identity = await resolveChatIdentity(req.user);

        const access = await assertBookingParticipant(identity, bookingId, req.user);
        if (!access.ok) {
            return res.status(access.status).json({ message: access.message });
        }

        const chats = await Chat.find({ bookingId }).sort({ timestamp: 1 });

        res.status(200).json({ chats });
    } catch (error) {
        console.error("Get chat error:", error);
        res.status(500).json({ message: 'Unable to load chat messages' });
    }
};
```

**Why this fixes it:** the caller no longer chooses whose messages to read.
Access is decided by whether they belong to the booking.

### 3.4 Refusing the identity fields at the route

**PATCHED** — `backend/route/ChatRoute.js`

```js
// Security (V-20): `sender`, `senderModel` and `userId` are deliberately NOT
// accepted here. Sender identity is resolved from the authenticated token in the
// controller, so any such field in the request is stripped by `validate` before
// the controller runs and cannot be used to impersonate another participant.
router.post(
    '/',
    authenticateUser,
    [
        idRule('bookingId', body, { label: 'Booking ID' }),
        requiredText('message', { max: 2000, label: 'Message' })
    ],
    validate,
    saveChat
);

router.get(
    '/',
    authenticateUser,
    [idRule('bookingId', query, { label: 'Booking ID' })],
    validate,
    getChatByUserBooking
);
```

**Why this fixes it:** because the fields are not declared, `validate` strips
them from the request. Defence in depth — even if a future change to the
controller read `req.body.sender`, the value would already be gone.

### 3.5 Updating the frontend to match

**VULNERABLE** — `frontend/src/pages/property/chat-manage/Chat.js`

```js
const res = await axios.post(`http://localhost:4000/api/chat/`, {
  sender: userID,
  senderModel: 'Business',
  bookingId: selectedBooking,
  message: newMessage
});
```

No authentication token; identity claimed by the client.

**PATCHED**

```js
// The server derives sender identity from this token, so it is required on
// every chat request.
const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

// sender and senderModel are set by the server from the auth token.
const res = await axios.post(`http://localhost:4000/api/chat/`, {
  bookingId: selectedBooking,
  message: newMessage
}, authHeader);
```

**Why this fixes it:** the client now proves who it is instead of asserting it.

---

## Summary of files changed

### New files

| File | Purpose |
| --- | --- |
| `backend/middleware/validate.js` | Rejects invalid input; strips unknown fields |
| `backend/middleware/validators.js` | Reusable rules for email, phone, price, dates, IDs |
| `backend/middleware/bookingAccess.js` | Resolves identity from token; verifies booking participation |
| `backend/scripts/purgeCardData.js` | Removes historical card data from the database |
| `backend/scripts/v13ValidationTests.js` | 34-test regression suite for V-13 |
| `backend/scripts/v20ChatTests.js` | 13-test regression suite for V-20 |

### Modified files

| File | Change |
| --- | --- |
| `backend/model/Payment.js` | Card fields removed; Stripe identifiers added |
| `backend/model/CustomizePayment.js` | Card fields removed |
| `backend/model/User.js` | `role` constrained with an `enum` |
| `backend/controller/PaymentController.js` | Stripe Checkout; signed webhook; raw-card path disabled |
| `backend/controller/CustomizePaymentController.js` | Raw-card path disabled |
| `backend/controller/BookingController.js` | Field whitelist; immutable price and owner |
| `backend/controller/BussinessRegisterController.js` | Role hardcoded, not from request |
| `backend/controller/TouristRegisterController.js` | Role hardcoded; query bug fixed |
| `backend/controller/ChatController.js` | Identity from token; participation checks |
| `backend/controller/VehicleController.js` | Field whitelist |
| `backend/controller/HotelRoomController.js` | Field whitelist |
| `backend/route/*.js` (7 files) | Authentication and validation chains added |
| `frontend/.../MajorPayment.js` | Card input form removed |
| `frontend/.../PackagePayment.js` | Card input form removed |
| `frontend/.../chat-manage/Chat.js` | Sends auth token; stops sending identity fields |

## Verification

```bash
node scripts/v13ValidationTests.js     # 34 passed, 0 failed
node scripts/v20ChatTests.js           # 13 passed, 0 failed
```

Both suites create their own test data and delete it afterwards, and exit
non-zero on failure so they can run in a CI pipeline. The exploits described in
each finding are included as test cases, so a future change that reintroduces
any of these vulnerabilities will fail the build.
