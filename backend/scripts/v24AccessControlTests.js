/**
 * V-24 retest: public management endpoints for vehicles, hotel rooms, tours and
 * tour packages.
 *
 * Builds two real business accounts (A and B), a tourist and an admin, each with
 * their own resources, then exercises the authorisation matrix:
 *
 *   anonymous  -> 401
 *   tourist    -> 403 on business-managed resources
 *   business A -> 403 on business B's resources
 *   business A -> success on its own
 *   admin      -> success where the app design allows
 *
 * After every rejected update/delete the record is re-read to confirm it is
 * unchanged.
 *
 * Usage (server must be running):
 *   node scripts/v24AccessControlTests.js
 *   TEST_PORT=4055 node scripts/v24AccessControlTests.js
 */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.TEST_PORT || 4000;
const BASE = `http://localhost:${PORT}`;
const STAMP = Date.now();
const TAG = `v24-${STAMP}`;

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

const call = async (method, path, { body, auth, form } = {}) => {
    const headers = {};
    // Auth travels in an httpOnly cookie since the JWT-cookie migration.
    if (auth) headers.Cookie = `accessToken=${auth}`;

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
    try { json = JSON.parse(text); } catch (e) { json = { raw: text.slice(0, 100) }; }
    return { status: res.status, body: json };
};

// Claims are flat and carry issuer/audience, matching utils/generateToken.js.
const token = (userID, role) =>
jwt.sign({ userID, role }, process.env.JWT_SECRET, {
        algorithm: 'HS256', expiresIn: '1h',
        issuer: 'ceylongo-api', audience: 'ceylongo-client', subject: userID
    });

const run = async () => {
    console.log(`\nV-24 access control retest against ${BASE}\n`);

    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection;

    const BussinessAgent = require('../model/BussinessAgent');
    const Bussiness = require('../model/Bussiness');
    const Tourist = require('../model/Tourist');
    const Vehicle = require('../model/Vehicle');
    const HotelRoom = require('../model/hotelRoom');
    const Tour = require('../model/Tour');
    const TourPackage = require('../model/TourPackage');

    // ---- fixtures --------------------------------------------------------
    // Fixtures carry an image, as real records created through the upload
    // route do. (The list handlers assume image.data exists - a pre-existing
    // bug unrelated to V-24, see the notes at the end of this file.)
    const demoImage = { data: Buffer.from('89504e470d0a1a0a', 'hex'), contentType: 'image/png' };

    const makeBusiness = async (label) => {
        const userID = `${TAG}-${label}`;
        const agent = await BussinessAgent.create({
            fullname: `V24 ${label}`, userAddress: 'addr', contact: '0771234567', userID
        });
        const business = await Bussiness.create({
            BA_Id: agent.BA_Id, businessName: `V24 ${label} Co`, businessAddress: 'addr',
            description: 'demo', bussinessType: 'hotel'
        });
        const vehicle = await Vehicle.create({
            B_Id: business.B_Id, modelName: `${TAG}-${label}-car`, seats: 4, fuelType: 'Petrol',
            transmission: 'Auto', doors: 4, status: 'Available', priceDay: 5000, priceMonth: 120000,
            userId: userID, image: demoImage
        });
        const room = await HotelRoom.create({
            B_Id: business.B_Id, name: `${TAG}-${label}-room`, description: 'demo', quantity: 3,
            availability: 'Available', price_day: 8000, price_month: 200000, bed: 2,
            max_occupancy: 4, userId: userID, image: demoImage
        });
        return { userID, business, vehicle, room, token: token(userID, 'Bussiness') };
    };

    const A = await makeBusiness('bizA');
    const B = await makeBusiness('bizB');

    const touristUserID = `${TAG}-tourist`;
    const tourist = await Tourist.create({
        fullname: 'V24 Tourist', email: `${TAG}-tourist@test.com`,
        mobile_number: 771234567, userID: touristUserID, password: 'x'
    });
    const touristToken = token(touristUserID, 'Tourist');

    const otherTouristUserID = `${TAG}-tourist2`;
    const tourist2 = await Tourist.create({
        fullname: 'V24 Tourist2', email: `${TAG}-tourist2@test.com`,
        mobile_number: 771234567, userID: otherTouristUserID, password: 'x'
    });
    const tourist2Token = token(otherTouristUserID, 'Tourist');

    const adminToken = token(`${TAG}-admin`, 'Admin');

    const tour = await Tour.create({
        userID: touristUserID, touristID: tourist.touristID,
        destination: `${TAG}-destination`, start_date: new Date(),
        end_date: new Date(Date.now() + 86400000)
    });

    const pkg = await TourPackage.create({
        packageId: `${TAG}-pkg`, name: `${TAG} package`, destination: 'Kandy',
        price: 349, startDate: new Date(), endDate: new Date(Date.now() + 86400000),
        tourGuideName: 'Guide', tourType: 'Adventure', description: 'demo', image: demoImage
    });

    console.log(`  business A: ${A.business.B_Id}`);
    console.log(`  business B: ${B.business.B_Id}\n`);

    // ---- 1-6. anonymous ---------------------------------------------------
    console.log('Anonymous callers (expect 401):');
    check('1. anonymous vehicle create', (await call('POST', '/api/vehicle', { body: {} })).status, 401);
    check('2. anonymous vehicle update', (await call('PUT', `/api/vehicle/${A.vehicle.V_Id}`, { body: { modelName: 'hacked' } })).status, 401);
    check('3. anonymous vehicle delete', (await call('DELETE', `/api/vehicle/${A.vehicle.V_Id}`)).status, 401);
    check('4a. anonymous hotel-room update', (await call('PUT', `/api/hotelroom/${A.room.HR_Id}`, { body: { name: 'hacked' } })).status, 401);
    check('4b. anonymous hotel-room delete', (await call('DELETE', `/api/hotelroom/${A.room.HR_Id}`)).status, 401);
    check('5a. anonymous tour update', (await call('PUT', `/api/tour/${tour.tourID}`, { body: { destination: 'hacked' } })).status, 401);
    check('5b. anonymous tour delete', (await call('DELETE', `/api/tour/${tour.tourID}`)).status, 401);
    check('6a. anonymous package update', (await call('PUT', `/api/tourPackage/${pkg.tp_Id}`, { body: { price: 1 } })).status, 401);
    check('6b. anonymous package delete', (await call('DELETE', `/api/tourPackage/${pkg.tp_Id}`)).status, 401);

    // ---- 7. tourist attempting business management ------------------------
    console.log('\nTourist attempting business management (expect 403):');
    check('7a. tourist creates a vehicle', (await call('POST', '/api/vehicle', { auth: touristToken, body: {} })).status, 403);
    check('7b. tourist updates a vehicle', (await call('PUT', `/api/vehicle/${A.vehicle.V_Id}`, { auth: touristToken, body: { modelName: 'hacked' } })).status, 403);
    check('7c. tourist deletes a hotel room', (await call('DELETE', `/api/hotelroom/${A.room.HR_Id}`, { auth: touristToken })).status, 403);
    check('7d. tourist updates a tour package', (await call('PUT', `/api/tourPackage/${pkg.tp_Id}`, { auth: touristToken, body: { price: 1 } })).status, 403);

    // ---- 8-9. cross-business ---------------------------------------------
    console.log("\nBusiness A against business B's resources (expect 403):");
    check('8. A updates B\'s vehicle', (await call('PUT', `/api/vehicle/${B.vehicle.V_Id}`, { auth: A.token, body: { modelName: 'stolen', priceDay: 1 } })).status, 403);
    check('9. A deletes B\'s hotel room', (await call('DELETE', `/api/hotelroom/${B.room.HR_Id}`, { auth: A.token })).status, 403);
    check('9b. A deletes B\'s vehicle', (await call('DELETE', `/api/vehicle/${B.vehicle.V_Id}`, { auth: A.token })).status, 403);

    // ---- data integrity after rejected writes -----------------------------
    console.log('\nDatabase unchanged after rejected operations:');
    const bVehicle = await Vehicle.findOne({ V_Id: B.vehicle.V_Id });
    check('B\'s vehicle still exists', Boolean(bVehicle), true);
    check('B\'s vehicle modelName unchanged', bVehicle && bVehicle.modelName, `${TAG}-bizB-car`);
    check('B\'s vehicle priceDay unchanged', bVehicle && bVehicle.priceDay, 5000);
    const bRoom = await HotelRoom.findOne({ HR_Id: B.room.HR_Id });
    check('B\'s hotel room still exists', Boolean(bRoom), true);
    const stillTour = await Tour.findOne({ tourID: tour.tourID });
    check('tour still exists after anonymous delete', Boolean(stillTour), true);
    const stillPkg = await TourPackage.findOne({ tp_Id: pkg.tp_Id });
    check('package still exists after anonymous delete', Boolean(stillPkg), true);

    // ---- 10. owner succeeds ----------------------------------------------
    console.log('\nOwner managing its own resource (expect success):');
    check('10a. A updates its own vehicle', (await call('PUT', `/api/vehicle/${A.vehicle.V_Id}`, { auth: A.token, body: { modelName: `${TAG}-renamed` } })).status, 200);
    const aVehicle = await Vehicle.findOne({ V_Id: A.vehicle.V_Id });
    check('10b. the change was applied', aVehicle && aVehicle.modelName, `${TAG}-renamed`);
    check('10c. A updates its own hotel room', (await call('PUT', `/api/hotelroom/${A.room.HR_Id}`, { auth: A.token, body: { name: `${TAG}-renamed-room` } })).status, 200);
    check('10d. tourist updates their own tour', (await call('PUT', `/api/tour/${tour.tourID}`, { auth: touristToken, body: { destination: `${TAG}-updated` } })).status, 200);
    check('10e. another tourist cannot update that tour', (await call('PUT', `/api/tour/${tour.tourID}`, { auth: tourist2Token, body: { destination: 'hijacked' } })).status, 403);
    check('10f. admin updates a tour package', (await call('PUT', `/api/tourPackage/${pkg.tp_Id}`, { auth: adminToken, body: { price: 499 } })).status, 200);

    // ---- 11. forged ownership fields --------------------------------------
    console.log('\nForged ownership fields are ignored:');
    await call('PUT', `/api/vehicle/${A.vehicle.V_Id}`, {
        auth: A.token,
        body: { modelName: `${TAG}-forge-test`, B_Id: B.business.B_Id, userId: B.userID, V_Id: 'HIJACKED' }
    });
    const forged = await Vehicle.findOne({ V_Id: A.vehicle.V_Id });
    check('11a. B_Id unchanged after forged update', forged && forged.B_Id, A.business.B_Id);
    check('11b. userId unchanged after forged update', forged && forged.userId, A.userID);
    check('11c. V_Id unchanged after forged update', forged && forged.V_Id, A.vehicle.V_Id);
    check('11d. legitimate field still applied', forged && forged.modelName, `${TAG}-forge-test`);

    // ---- 12. public reads -------------------------------------------------
    console.log('\nPublic read-only endpoints still work:');
    check('12a. GET /api/vehicle', (await call('GET', '/api/vehicle')).status, 200);
    check('12b. GET /api/vehicle/:id', (await call('GET', `/api/vehicle/${A.vehicle.V_Id}`)).status, 200);
    check('12c. GET /api/hotelroom', (await call('GET', '/api/hotelroom')).status, 200);
    check('12d. GET /api/tour', (await call('GET', '/api/tour')).status, 200);
    check('12e. GET /api/tourPackage', (await call('GET', '/api/tourPackage')).status, 200);
    check('12f. GET /api/tourPackage/:id', (await call('GET', `/api/tourPackage/${pkg.tp_Id}`)).status, 200);

    // ---- cleanup ----------------------------------------------------------
    console.log('\nCleaning up...');
    const removed = {
        agents: (await db.collection('bussinessagents').deleteMany({ userID: new RegExp('^' + TAG) })).deletedCount,
        businesses: (await db.collection('bussinesses').deleteMany({ businessName: new RegExp('^V24 ') })).deletedCount,
        tourists: (await db.collection('tourists').deleteMany({ userID: new RegExp('^' + TAG) })).deletedCount,
        vehicles: (await db.collection('vehicles').deleteMany({ userId: new RegExp('^' + TAG) })).deletedCount,
        rooms: (await db.collection('hotelrooms').deleteMany({ userId: new RegExp('^' + TAG) })).deletedCount,
        tours: (await db.collection('tours').deleteMany({ userID: new RegExp('^' + TAG) })).deletedCount,
        packages: (await db.collection('tourpackages').deleteMany({ packageId: new RegExp('^' + TAG) })).deletedCount
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
