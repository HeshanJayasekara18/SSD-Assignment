/**
 * V-20 retest: unauthenticated chat access and sender spoofing.
 *
 * Builds two real tourist accounts (A and B) with a booking each, then attempts
 * the attacks named in the finding:
 *   - unauthenticated access
 *   - reading account B's conversation using account A's token
 *   - writing into account B's conversation using account A's token
 *   - forging the `sender` / `senderModel` fields
 *
 * Usage (server must be running):
 *   node scripts/v20ChatTests.js
 *   TEST_PORT=4055 node scripts/v20ChatTests.js
 */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.TEST_PORT || 4000;
const BASE = `http://localhost:${PORT}`;
const STAMP = Date.now();

let passed = 0;
let failed = 0;
const failures = [];

const check = (name, actual, expected) => {
    if (actual === expected) {
        passed += 1;
        console.log(`  PASS  ${name}  (${actual})`);
    } else {
        failed += 1;
        failures.push(`${name}: expected ${expected}, got ${actual}`);
        console.log(`  FAIL  ${name}  expected ${expected}, got ${actual}`);
    }
};

const call = async (method, path, { body, auth } = {}) => {
    const headers = {};
    if (auth) headers.Authorization = `Bearer ${auth}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const res = await fetch(BASE + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch (e) { json = { raw: text.slice(0, 120) }; }
    return { status: res.status, body: json };
};

const run = async () => {
    console.log(`\nV-20 chat authorisation retest against ${BASE}\n`);

    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection;
    const Tourist = require('../model/Tourist');
    const Booking = require('../model/Booking');

    // --- two real tourists, each with their own booking -------------------
    const mk = async (label) => {
        const userID = `v20-${label}-${STAMP}`;
        const tourist = await Tourist.create({
            fullname: `V20 ${label}`,
            email: `v20-${label}-${STAMP}@test.com`,
            mobile_number: 771234567,
            userID
        });
        const booking = await Booking.create({
            name: `V20 ${label} booking`,
            booking_type: 'hotel',
            booking_date: new Date(),
            booking_time: '10:00',
            start_date: new Date(),
            end_date: new Date(Date.now() + 86400000),
            mobile_number: 771234567,
            payID: `pay-${label}`,
            tourID: `tour-${label}`,
            payment_amount: 100,
            touristID: tourist.touristID,
            B_Id: `biz-${label}-${STAMP}`
        });
        const token = jwt.sign(
            { user: { userID, email: tourist.email, role: 'Tourist' } },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return { tourist, booking, token, userID };
    };

    const A = await mk('alice');
    const B = await mk('bob');

    console.log(`  account A booking: ${A.booking.bookingID}`);
    console.log(`  account B booking: ${B.booking.bookingID}\n`);

    // --- 1. authentication ------------------------------------------------
    console.log('Authentication:');
    check('POST /api/chat with no token', (await call('POST', '/api/chat', {
        body: { bookingId: A.booking.bookingID, message: 'hi' }
    })).status, 401);
    check('GET  /api/chat with no token', (await call('GET',
        `/api/chat?bookingId=${A.booking.bookingID}`)).status, 401);
    check('POST /api/chat/bookingByBussinessId with no token',
        (await call('POST', '/api/chat/bookingByBussinessId', { body: {} })).status, 401);

    // --- 2. cross-account access (the finding's retest) -------------------
    console.log('\nAccount A attempting to use account B\'s booking:');
    check('A writes into B\'s conversation', (await call('POST', '/api/chat', {
        auth: A.token,
        body: { bookingId: B.booking.bookingID, message: 'injected by A' }
    })).status, 403);
    check('A reads B\'s conversation', (await call('GET',
        `/api/chat?bookingId=${B.booking.bookingID}`, { auth: A.token })).status, 403);

    // --- 3. own booking still works --------------------------------------
    console.log('\nLegitimate use (account A on its own booking):');
    const own = await call('POST', '/api/chat', {
        auth: A.token,
        body: { bookingId: A.booking.bookingID, message: 'hello from A' }
    });
    check('A writes to its own conversation', own.status, 201);
    check('A reads its own conversation', (await call('GET',
        `/api/chat?bookingId=${A.booking.bookingID}`, { auth: A.token })).status, 200);

    // --- 4. sender spoofing ----------------------------------------------
    console.log('\nSender spoofing:');
    const forged = await call('POST', '/api/chat', {
        auth: A.token,
        body: {
            bookingId: A.booking.bookingID,
            message: 'forged sender attempt',
            sender: B.tourist.touristID,   // <-- pretending to be B
            senderModel: 'Business'        // <-- pretending to be staff
        }
    });
    check('forged request still accepted (fields ignored)', forged.status, 201);
    check('stored sender is A, not the forged value',
        forged.body.chat && forged.body.chat.sender, A.tourist.touristID);
    check('stored senderModel is Tourist, not the forged value',
        forged.body.chat && forged.body.chat.senderModel, 'Tourist');

    // --- 5. message validation -------------------------------------------
    console.log('\nMessage validation:');
    check('empty message', (await call('POST', '/api/chat', {
        auth: A.token, body: { bookingId: A.booking.bookingID, message: '' }
    })).status, 400);
    check('oversized message (>2000)', (await call('POST', '/api/chat', {
        auth: A.token, body: { bookingId: A.booking.bookingID, message: 'x'.repeat(5000) }
    })).status, 400);
    check('unknown booking', (await call('POST', '/api/chat', {
        auth: A.token, body: { bookingId: 'no-such-booking', message: 'hi' }
    })).status, 404);

    // --- cleanup ----------------------------------------------------------
    console.log('\nCleaning up...');
    const removed = {
        tourists: (await db.collection('tourists').deleteMany({ email: /^v20-/ })).deletedCount,
        bookings: (await db.collection('bookings').deleteMany({ name: /^V20 / })).deletedCount,
        chats: (await db.collection('chats').deleteMany({
            bookingId: { $in: [A.booking.bookingID, B.booking.bookingID] }
        })).deletedCount
    };
    console.log(' ', JSON.stringify(removed));

    await mongoose.disconnect();

    console.log(`\n${'='.repeat(50)}`);
    console.log(`  PASSED: ${passed}    FAILED: ${failed}`);
    console.log(`${'='.repeat(50)}`);
    if (failures.length) {
        console.log('\nFailures:');
        failures.forEach((f) => console.log('  - ' + f));
    }
    console.log('');

    process.exit(failed === 0 ? 0 : 1);
};

run().catch(async (error) => {
    console.error('\nTest run aborted:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
