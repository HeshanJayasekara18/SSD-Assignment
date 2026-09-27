/**
 * Fixture helper for the V-24 attack demo (scripts/v24Attack.ps1).
 *
 * Creates two real business accounts (Alpha and Beta), each owning a vehicle and
 * a hotel room, plus a tourist account. Prints a pipe-separated line the demo
 * script parses:
 *
 *   alphaToken|alphaVehicle|alphaRoom|betaToken|betaVehicle|betaRoom|touristToken|alphaB_Id|betaB_Id
 *
 * Run with --cleanup to delete everything it created.
 */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const CLEANUP = process.argv.includes('--cleanup');
const TAG = 'v24demo';

const wipe = async (db) => {
    await db.collection('bussinessagents').deleteMany({ userID: new RegExp('^' + TAG) });
    await db.collection('bussinesses').deleteMany({ businessName: new RegExp('^' + TAG) });
    await db.collection('tourists').deleteMany({ userID: new RegExp('^' + TAG) });
    await db.collection('vehicles').deleteMany({ userId: new RegExp('^' + TAG) });
    await db.collection('hotelrooms').deleteMany({ userId: new RegExp('^' + TAG) });
};

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection;

    if (CLEANUP) {
        await wipe(db);
        await mongoose.disconnect();
        console.log('cleaned');
        return;
    }

    // Start clean so repeated demo runs are consistent.
    await wipe(db);

    const BussinessAgent = require('../model/BussinessAgent');
    const Bussiness = require('../model/Bussiness');
    const Tourist = require('../model/Tourist');
    const Vehicle = require('../model/Vehicle');
    const HotelRoom = require('../model/hotelRoom');

    const image = { data: Buffer.from('89504e470d0a1a0a', 'hex'), contentType: 'image/png' };

    const makeBusiness = async (label, carName, roomName, price) => {
        const userID = `${TAG}-${label}`;
        const agent = await BussinessAgent.create({
            fullname: `${label} Owner`, userAddress: 'Colombo', contact: '0771234567', userID
        });
        const business = await Bussiness.create({
            BA_Id: agent.BA_Id, businessName: `${TAG} ${label} Tours`, businessAddress: 'Colombo',
            description: 'demo business', bussinessType: 'hotel'
        });
        const vehicle = await Vehicle.create({
            B_Id: business.B_Id, modelName: carName, seats: 4, fuelType: 'Petrol',
            transmission: 'Automatic', doors: 4, status: 'Available',
            priceDay: price, priceMonth: price * 25, userId: userID, image
        });
        const room = await HotelRoom.create({
            B_Id: business.B_Id, name: roomName, description: 'Sea view', quantity: 5,
            availability: 'Available', price_day: price * 2, price_month: price * 50,
            bed: 2, max_occupancy: 4, userId: userID, image
        });
        const token = jwt.sign(
            { userID, role: 'Bussiness' }, process.env.JWT_SECRET,
            { algorithm: 'HS256', expiresIn: '1h', issuer: 'ceylongo-api',
              audience: 'ceylongo-client', subject: userID }
        );
        return { business, vehicle, room, token };
    };

    const alpha = await makeBusiness('Alpha', 'Alpha Toyota Axio', 'Alpha Deluxe Room', 5000);
    const beta = await makeBusiness('Beta', 'Beta Nissan Leaf', 'Beta Ocean Suite', 8000);

    const touristUserID = `${TAG}-tourist`;
    await Tourist.create({
        fullname: 'Demo Tourist', email: `${TAG}-tourist@test.com`,
        mobile_number: 771234567, userID: touristUserID, password: 'x'
    });
    const touristToken = jwt.sign(
        { userID: touristUserID, role: 'Tourist' }, process.env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '1h', issuer: 'ceylongo-api',
          audience: 'ceylongo-client', subject: touristUserID }
    );

    await mongoose.disconnect();

    console.log([
        alpha.token, alpha.vehicle.V_Id, alpha.room.HR_Id,
        beta.token, beta.vehicle.V_Id, beta.room.HR_Id,
        touristToken, alpha.business.B_Id, beta.business.B_Id
    ].join('|'));
};

run().catch(async (error) => {
    console.error('fixture setup failed:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
