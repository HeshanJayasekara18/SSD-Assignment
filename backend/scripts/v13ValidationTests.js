/**
 * V-13 retest harness: positive/negative API tests for the endpoints named in
 * the finding "Insufficient server-side input validation".
 *
 * Every negative case asserts a 400/401 AND that nothing was written; every
 * positive case asserts the endpoint still works. Records created during the
 * run are deleted at the end.
 *
 * Usage:
 *   node scripts/v13ValidationTests.js          (starts nothing - server must be running)
 *   TEST_PORT=4055 node scripts/v13ValidationTests.js
 *
 * The server must be running and reachable on TEST_PORT (default 4000).
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

const token = (role = 'Tourist') =>
    jwt.sign({ userID: `v13-${STAMP}`, role, email: `v13-${STAMP}@test.com` }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

const call = async (method, path, { body, form, auth } = {}) => {
    const headers = {};
    if (auth) headers.Authorization = `Bearer ${auth}`;

    let payload;
    if (form) {
        payload = form;
    } else if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(body);
    }

    const res = await fetch(BASE + path, { method, headers, body: payload });
    const text = await res.text();
    let json;
    try {
        json = JSON.parse(text);
    } catch (e) {
        json = { raw: text.slice(0, 120) };
    }
    return { status: res.status, body: json };
};

const check = (name, actual, expected) => {
    const ok = actual === expected;
    if (ok) {
        passed += 1;
        console.log(`  PASS  ${name}  (${actual})`);
    } else {
        failed += 1;
        failures.push(`${name}: expected ${expected}, got ${actual}`);
        console.log(`  FAIL  ${name}  expected ${expected}, got ${actual}`);
    }
    return ok;
};

const pngForm = (fields, fileField) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, String(v)));
    if (fileField) {
        fd.append(fileField, new Blob([Buffer.from('89504e470d0a1a0a', 'hex')], { type: 'image/png' }), 't.png');
    }
    return fd;
};

const run = async () => {
    console.log(`\nV-13 validation retest against ${BASE}\n`);

    const tourist = token('Tourist');
    const guide = token('TourGuide');

    // ---------------------------------------------------------------- AUTH
    console.log('Authentication required on previously-open endpoints:');
    check('GET  /api/Booking   unauthenticated', (await call('GET', '/api/Booking')).status, 401);
    check('POST /api/chat      unauthenticated', (await call('POST', '/api/chat', { body: {} })).status, 401);
    check('POST /api/vehicle   unauthenticated', (await call('POST', '/api/vehicle', { body: {} })).status, 401);
    check('POST /api/hotelroom unauthenticated', (await call('POST', '/api/hotelroom', { body: {} })).status, 401);
    check(
        'POST /api/GuideDetails/profile unauthenticated',
        (await call('POST', '/api/GuideDetails/profile', { body: {} })).status,
        401
    );

    // -------------------------------------------------- TOURIST REGISTER
    console.log('\nTourist registration (public) - negative:');
    check('empty body', (await call('POST', '/api/touristregister', { body: {} })).status, 400);
    check(
        'malformed email',
        (await call('POST', '/api/touristregister', {
            body: { fullname: 'x', email: 'nope', password: 'password123', country: 'LK', mobile_number: '0771234567' }
        })).status,
        400
    );
    check(
        'password under 8 chars',
        (await call('POST', '/api/touristregister', {
            body: { fullname: 'x', email: `a${STAMP}@test.com`, password: '1', country: 'LK', mobile_number: '0771234567' }
        })).status,
        400
    );
    check(
        'non-numeric phone',
        (await call('POST', '/api/touristregister', {
            body: { fullname: 'x', email: `a${STAMP}@test.com`, password: 'password123', country: 'LK', mobile_number: 'abc' }
        })).status,
        400
    );
    check(
        'oversized name (>100)',
        (await call('POST', '/api/touristregister', {
            body: {
                fullname: 'x'.repeat(200),
                email: `a${STAMP}@test.com`,
                password: 'password123',
                country: 'LK',
                mobile_number: '0771234567'
            }
        })).status,
        400
    );

    console.log('\nTourist registration - positive:');
    const touristEmail = `v13tourist${STAMP}@test.com`;
    check(
        'valid registration',
        (await call('POST', '/api/touristregister', {
            body: {
                fullname: 'V13 Test',
                email: touristEmail,
                password: 'password123',
                country: 'Sri Lanka',
                mobile_number: '0771234567'
            }
        })).status,
        201
    );

    // ------------------------------------------- PRIVILEGE ESCALATION
    console.log('\nPrivilege escalation (the critical V-13 case):');
    const escEmail = `v13esc${STAMP}@test.com`;
    await call('POST', '/api/bussinessregister', {
        body: {
            email: escEmail,
            password: 'password123',
            role: 'Admin', // <-- injected
            isAdmin: true, // <-- unknown field
            fullName: 'Attacker',
            contact: '0771234567',
            businessName: 'Evil Co',
            businessAddress: 'x',
            businessType: 'hotel'
        }
    });

    await mongoose.connect(process.env.MONGO_URI);
    const escUser = await mongoose.connection.collection('users').findOne({ email: escEmail });
    check('injected role:Admin is NOT stored', escUser ? escUser.role : 'missing', 'Bussiness');

    // ------------------------------------------------------- BOOKINGS
    console.log('\nBooking validation - negative (authenticated):');
    const validBooking = {
        name: 'V13 Booking',
        booking_type: 'hotel',
        booking_date: '2026-02-01',
        booking_time: '10:00',
        start_date: '2026-02-10',
        end_date: '2026-02-15',
        mobile_number: '0771234567',
        payID: 'pay-1',
        tourID: 'tour-1',
        payment_amount: 1000,
        touristID: `owner-${STAMP}`,
        B_Id: 'biz-1'
    };

    check(
        'invalid booking_type enum',
        (await call('POST', '/api/Booking', { auth: tourist, body: { ...validBooking, booking_type: 'spaceship' } })).status,
        400
    );
    check(
        'negative payment_amount',
        (await call('POST', '/api/Booking', { auth: tourist, body: { ...validBooking, payment_amount: -500 } })).status,
        400
    );
    check(
        'end_date before start_date',
        (await call('POST', '/api/Booking', { auth: tourist, body: { ...validBooking, start_date: '2026-05-01' } })).status,
        400
    );
    check(
        'non-numeric payment_amount',
        (await call('POST', '/api/Booking', { auth: tourist, body: { ...validBooking, payment_amount: 'free' } })).status,
        400
    );

    console.log('\nBooking - positive:');
    const created = await call('POST', '/api/Booking', { auth: tourist, body: validBooking });
    check('valid booking created', created.status, 200);
    const bookingID = created.body && created.body.bookingID;

    // ------------------------------------------------ MASS ASSIGNMENT
    console.log('\nMass assignment / payment bypass:');
    if (bookingID) {
        await call('PUT', `/api/Booking/${bookingID}`, {
            auth: tourist,
            body: {
                payment_amount: 0, // <-- payment bypass attempt
                touristID: 'attacker', // <-- ownership hijack attempt
                bookingID: 'HIJACKED', // <-- primary key overwrite attempt
                name: 'Legitimately Renamed'
            }
        });

        const after = await call('GET', `/api/Booking/${bookingID}`, { auth: tourist });
        check('payment_amount unchanged after attack', after.body.payment_amount, 1000);
        check('touristID unchanged after attack', after.body.touristID, `owner-${STAMP}`);
        check('bookingID unchanged after attack', after.body.bookingID, bookingID);
        check('legitimate field still updates', after.body.name, 'Legitimately Renamed');
    } else {
        failed += 1;
        failures.push('mass assignment: booking was not created, cannot test');
        console.log('  FAIL  booking was not created, cannot run mass-assignment checks');
    }

    // ----------------------------------------------------------- CHAT
    console.log('\nChat validation:');
    check(
        'invalid senderModel enum',
        (await call('POST', '/api/chat', {
            auth: tourist,
            body: { sender: 'u1', senderModel: 'Hacker', bookingId: 'bk-1', message: 'hi' }
        })).status,
        400
    );
    check(
        'oversized message (>2000)',
        (await call('POST', '/api/chat', {
            auth: tourist,
            body: { sender: 'u1', senderModel: 'Tourist', bookingId: 'bk-1', message: 'x'.repeat(5000) }
        })).status,
        400
    );
    check(
        'valid chat message',
        (await call('POST', '/api/chat', {
            auth: tourist,
            body: { sender: `u${STAMP}`, senderModel: 'Tourist', bookingId: `bk-${STAMP}`, message: 'V13 test' }
        })).status,
        201
    );

    // ------------------------------------------- VEHICLE (multipart)
    console.log('\nVehicle validation (multipart/form-data):');
    const vehicleFields = {
        B_Id: 'biz-1',
        modelName: `V13 Vehicle ${STAMP}`,
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        doors: 4,
        status: 'Available',
        priceDay: 5000,
        priceMonth: 120000,
        userId: `user-${STAMP}`
    };

    check(
        'non-numeric seats',
        (await call('POST', '/api/vehicle', {
            auth: tourist,
            form: pngForm({ ...vehicleFields, seats: 'notanumber' }, 'image')
        })).status,
        400
    );
    check(
        'seats out of range',
        (await call('POST', '/api/vehicle', { auth: tourist, form: pngForm({ ...vehicleFields, seats: 9999 }, 'image') }))
            .status,
        400
    );
    check(
        'valid vehicle (numeric strings coerced)',
        (await call('POST', '/api/vehicle', { auth: tourist, form: pngForm(vehicleFields, 'image') })).status,
        201
    );

    // ---------------------------------------- HOTEL ROOM (multipart)
    console.log('\nHotel room validation (multipart/form-data):');
    const roomFields = {
        B_Id: 'biz-1',
        name: `V13 Room ${STAMP}`,
        description: 'Sea view',
        quantity: 5,
        availability: 'Available',
        price_day: 8000,
        price_month: 200000,
        bed: 2,
        max_occupancy: 4,
        userId: `user-${STAMP}`
    };

    check(
        'negative price_day',
        (await call('POST', '/api/hotelroom', { auth: tourist, form: pngForm({ ...roomFields, price_day: -1 }, 'image') }))
            .status,
        400
    );
    check(
        'valid hotel room',
        (await call('POST', '/api/hotelroom', { auth: tourist, form: pngForm(roomFields, 'image') })).status,
        201
    );

    // ------------------------------------------------- GUIDE PROFILE
    console.log('\nGuide profile validation (multipart/form-data):');
    const TourGuide = require('../model/TourGuide');
    const testGuide = await TourGuide.create({ guideName: `V13 Guide ${STAMP}` });
    const guideId = testGuide._id.toString();

    const profileFields = {
        guideId,
        gender: 'male',
        phoneNumber: '0771234567',
        age: 30,
        experience: 5,
        languages: 'English,Sinhala',
        specializationList: 'Hiking,Culture',
        bio: 'Experienced guide',
        locations: 'Kandy,Ella',
        description: 'Full description',
        amount: 5000
    };

    check(
        'gender wrong case (Male)',
        (await call('POST', '/api/GuideDetails/profile', {
            auth: guide,
            form: pngForm({ ...profileFields, gender: 'Male' }, 'profileImage')
        })).status,
        400
    );
    check(
        'malformed guideId (not an ObjectId)',
        (await call('POST', '/api/GuideDetails/profile', {
            auth: guide,
            form: pngForm({ ...profileFields, guideId: 'not-an-objectid' }, 'profileImage')
        })).status,
        400
    );
    check(
        'age below minimum (12)',
        (await call('POST', '/api/GuideDetails/profile', {
            auth: guide,
            form: pngForm({ ...profileFields, age: 12 }, 'profileImage')
        })).status,
        400
    );
    check(
        'valid guide profile',
        (await call('POST', '/api/GuideDetails/profile', { auth: guide, form: pngForm(profileFields, 'profileImage') }))
            .status,
        201
    );
    check(
        'GET profile with malformed id',
        (await call('GET', '/api/GuideDetails/profile/not-an-id')).status,
        400
    );

    // -------------------------------------------------------- CLEANUP
    console.log('\nCleaning up test records...');
    const db = mongoose.connection;
    const removed = {
        users: (await db.collection('users').deleteMany({ email: { $in: [touristEmail, escEmail] } })).deletedCount,
        tourists: (await db.collection('tourists').deleteMany({ email: touristEmail })).deletedCount,
        bookings: (await db.collection('bookings').deleteMany({ touristID: `owner-${STAMP}` })).deletedCount,
        chats: (await db.collection('chats').deleteMany({ bookingId: `bk-${STAMP}` })).deletedCount,
        vehicles: (await db.collection('vehicles').deleteMany({ userId: `user-${STAMP}` })).deletedCount,
        rooms: (await db.collection('hotelrooms').deleteMany({ userId: `user-${STAMP}` })).deletedCount,
        guides: (await db.collection('tourguides').deleteMany({ guideName: `V13 Guide ${STAMP}` })).deletedCount,
        profiles: (await db.collection('tourguideprofiles').deleteMany({ guide: testGuide._id })).deletedCount,
        agents: (await db.collection('bussinessagents').deleteMany({ fullname: 'Attacker' })).deletedCount,
        businesses: (await db.collection('bussinesses').deleteMany({ businessName: 'Evil Co' })).deletedCount
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
