/**
 * V-13 LIVE DEMO — for viva / presentation.
 *
 * Runs the two real attacks against the running server, one at a time, pausing
 * between each so you can talk. Prints the exact curl command it is sending and
 * then reads the database back to show what was actually stored.
 *
 * Usage:
 *   node scripts/v13Demo.js              (server on port 4000)
 *   TEST_PORT=4055 node scripts/v13Demo.js
 *   node scripts/v13Demo.js --fast       (no pauses)
 *
 * Run it once on the vulnerable code and once on the fixed code; the output
 * tells you which one you are looking at.
 */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const readline = require('readline');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.TEST_PORT || 4000;
const BASE = `http://localhost:${PORT}`;
const FAST = process.argv.includes('--fast');
const STAMP = Date.now();

// Terminal colours so the result is readable from the back of a room.
const C = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    grey: '\x1b[90m'
};

const say = (s = '') => console.log(s);
const rule = () => say(C.grey + '─'.repeat(64) + C.reset);

const heading = (n, title) => {
    say('');
    rule();
    say(`${C.bold}${C.cyan}  ATTACK ${n}${C.reset}  ${C.bold}${title}${C.reset}`);
    rule();
    say('');
};

const pause = (label = 'Press ENTER to run the attack') =>
    new Promise((resolve) => {
        if (FAST) return resolve();
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(`${C.grey}   ${label}...${C.reset}`, () => {
            rl.close();
            say('');
            resolve();
        });
    });

const showCommand = (lines) => {
    say(`${C.yellow}   What an attacker sends:${C.reset}`);
    say('');
    lines.forEach((l) => say(`     ${C.dim}${l}${C.reset}`));
    say('');
};

const VULNERABLE = `${C.red}${C.bold}VULNERABLE${C.reset}`;
const BLOCKED = `${C.green}${C.bold}BLOCKED${C.reset}`;

let vulnerableCount = 0;

const run = async () => {
    say('');
    say(`${C.bold}  V-13 — Insufficient server-side input validation${C.reset}`);
    say(`${C.grey}  Live demonstration against ${BASE}${C.reset}`);

    // Confirm the server is up before promising anything on stage.
    try {
        await fetch(BASE + '/api/Booking');
    } catch (e) {
        say('');
        say(`${C.red}  Cannot reach ${BASE} — is the backend running?${C.reset}`);
        say('');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection;

    // ================================================== ATTACK 1
    heading(1, 'Anyone can make themselves an administrator');

    const email = `viva-attacker-${STAMP}@evil.com`;

    say('   The signup form in the browser only ever offers a business account.');
    say('   But the form is not what talks to the server — this is:');
    say('');
    showCommand([
        `curl -X POST ${BASE}/api/bussinessregister \\`,
        `  -H "Content-Type: application/json" \\`,
        `  -d '{"email":"${email}",`,
        `       "password":"password123",`,
        `       ${C.red}"role":"Admin"${C.reset}${C.dim},`,
        `       "fullName":"Attacker", "contact":"0771234567",`,
        `       "businessName":"Evil Co", "businessAddress":"x",`,
        `       "businessType":"hotel"}'`
    ]);

    await pause();

    await fetch(BASE + '/api/bussinessregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password: 'password123',
            role: 'Admin', // <-- the attack
            fullName: 'Attacker',
            contact: '0771234567',
            businessName: 'Evil Co',
            businessAddress: 'x',
            businessType: 'hotel'
        })
    });

    const stored = await db.collection('users').findOne({ email });
    const storedRole = stored ? stored.role : null;

    say(`   ${C.bold}What the database actually stored:${C.reset}`);
    say('');
    if (!stored) {
        say(`     role = ${C.grey}(account was not created)${C.reset}`);
        say('');
        say(`   Result: ${BLOCKED}  — the request was rejected outright.`);
    } else if (storedRole === 'Admin') {
        vulnerableCount += 1;
        say(`     role = ${C.red}${C.bold}"Admin"${C.reset}`);
        say('');
        say(`   Result: ${VULNERABLE}`);
        say(`   ${C.red}A stranger now has an administrator account on the system.${C.reset}`);
    } else {
        say(`     role = ${C.green}${C.bold}"${storedRole}"${C.reset}`);
        say('');
        say(`   Result: ${BLOCKED}`);
        say(`   The injected role was discarded. The endpoint decides the role,`);
        say(`   not the request.`);
    }

    // ================================================== ATTACK 2
    heading(2, 'Anyone can set a booking price to zero');

    const token = jwt.sign(
        { userID: `viva-${STAMP}`, role: 'Tourist', email: `viva-${STAMP}@test.com` },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    const owner = `real-customer-${STAMP}`;

    say('   First, a normal booking is made through the system — a $349 tour.');
    say('');

    const createRes = await fetch(BASE + '/api/Booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
            name: 'Sigiriya and Knuckles Adventure',
            booking_type: 'hotel',
            booking_date: '2026-02-01',
            booking_time: '10:00',
            start_date: '2026-02-10',
            end_date: '2026-02-15',
            mobile_number: '0771234567',
            payID: 'pay-viva',
            tourID: 'tour-viva',
            payment_amount: 349,
            touristID: owner,
            B_Id: 'biz-viva'
        })
    });

    const created = await createRes.json().catch(() => ({}));
    const bookingID = created.bookingID;

    if (!bookingID) {
        say(`   ${C.yellow}Could not create the demo booking (HTTP ${createRes.status}).${C.reset}`);
        say(`   ${C.grey}Skipping attack 2.${C.reset}`);
    } else {
        say(`     bookingID       = ${C.grey}${bookingID}${C.reset}`);
        say(`     payment_amount  = ${C.bold}349${C.reset}`);
        say(`     touristID       = ${C.bold}${owner}${C.reset}`);
        say('');
        say('   Stripe charges whatever this record says. So the attacker edits it:');
        say('');
        showCommand([
            `curl -X PUT ${BASE}/api/Booking/${bookingID} \\`,
            `  -H "Content-Type: application/json" \\`,
            `  -d '{${C.red}"payment_amount": 0${C.reset}${C.dim},`,
            `       ${C.red}"touristID": "attacker"${C.reset}${C.dim}}'`
        ]);

        await pause();

        await fetch(BASE + `/api/Booking/${bookingID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                payment_amount: 0, // <-- the attack
                touristID: 'attacker' // <-- ownership hijack
            })
        });

        const after = await db.collection('bookings').findOne({ bookingID });

        say(`   ${C.bold}What the database actually stored:${C.reset}`);
        say('');

        const amountBad = after && after.payment_amount === 0;
        const ownerBad = after && after.touristID === 'attacker';

        say(
            `     payment_amount  = ${amountBad ? C.red + C.bold : C.green + C.bold}${after ? after.payment_amount : '?'}${C.reset}` +
                (amountBad ? `   ${C.red}(was 349)${C.reset}` : `   ${C.green}(unchanged)${C.reset}`)
        );
        say(
            `     touristID       = ${ownerBad ? C.red + C.bold : C.green + C.bold}${after ? after.touristID : '?'}${C.reset}` +
                (ownerBad ? `   ${C.red}(hijacked)${C.reset}` : `   ${C.green}(unchanged)${C.reset}`)
        );
        say('');

        if (amountBad || ownerBad) {
            vulnerableCount += 1;
            say(`   Result: ${VULNERABLE}`);
            say(`   ${C.red}A $349 tour can now be paid for with $0 — through real Stripe.${C.reset}`);
        } else {
            say(`   Result: ${BLOCKED}`);
            say(`   Both fields are immutable after creation, so the edit was dropped.`);
        }
    }

    // ================================================== ATTACK 3
    heading(3, 'No login needed to read every customer booking');

    say('   These endpoints had no authentication at all.');
    say('');
    showCommand([`curl ${BASE}/api/Booking     ${C.grey}# no token, no password${C.reset}`]);

    await pause();

    const openRes = await fetch(BASE + '/api/Booking');
    say(`   ${C.bold}Server responded:${C.reset}  ${openRes.status === 200 ? C.red + C.bold : C.green + C.bold}HTTP ${openRes.status}${C.reset}`);
    say('');

    if (openRes.status === 200) {
        vulnerableCount += 1;
        const all = await openRes.json().catch(() => []);
        say(`   Result: ${VULNERABLE}`);
        say(`   ${C.red}Returned ${Array.isArray(all) ? all.length : '?'} bookings — names, phone numbers, dates — to a stranger.${C.reset}`);
    } else {
        say(`   Result: ${BLOCKED}  — authentication is now required.`);
    }

    // ================================================== SUMMARY
    say('');
    rule();
    if (vulnerableCount > 0) {
        say(`  ${C.red}${C.bold}  ${vulnerableCount} of 3 attacks SUCCEEDED — this code is vulnerable.${C.reset}`);
    } else {
        say(`  ${C.green}${C.bold}  0 of 3 attacks succeeded — all attacks blocked.${C.reset}`);
    }
    rule();
    say('');

    // Clean up everything this demo created.
    await db.collection('users').deleteMany({ email });
    await db.collection('bookings').deleteMany({ touristID: { $in: [owner, 'attacker'] } });
    await db.collection('bussinessagents').deleteMany({ fullname: 'Attacker' });
    await db.collection('bussinesses').deleteMany({ businessName: 'Evil Co' });
    say(`${C.grey}  (demo records cleaned up)${C.reset}`);
    say('');

    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error(`\n${C.red}Demo failed:${C.reset}`, error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
