/**
 * Fixture helper for the V-20 attack demo (scripts/v20Attack.ps1).
 *
 * Creates two real tourist accounts, Alice and Bob, each with their own booking
 * and one private chat message, then prints a pipe-separated line the demo
 * script parses:
 *
 *   aliceToken|aliceBooking|bobToken|bobBooking|aliceTouristID|bobTouristID
 *
 * Run with --cleanup to delete everything it created.
 */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const CLEANUP = process.argv.includes('--cleanup');
const TAG = 'v20demo';

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection;

    if (CLEANUP) {
        await db.collection('tourists').deleteMany({ email: new RegExp('^' + TAG) });
        await db.collection('bookings').deleteMany({ payID: TAG });
        await db.collection('chats').deleteMany({ message: new RegExp('^' + TAG) });
        await mongoose.disconnect();
        console.log('cleaned');
        return;
    }

    // Remove leftovers from a previous run so the demo always starts clean.
    await db.collection('tourists').deleteMany({ email: new RegExp('^' + TAG) });
    await db.collection('bookings').deleteMany({ payID: TAG });
    await db.collection('chats').deleteMany({ message: new RegExp('^' + TAG) });

    const Tourist = require('../model/Tourist');
    const Booking = require('../model/Booking');
    const Chat = require('../model/Chat');

    const make = async (name) => {
        const userID = `${TAG}-${name}-${Date.now()}`;
        const tourist = await Tourist.create({
            fullname: name,
            email: `${TAG}-${name}@test.com`,
            mobile_number: 771234567,
            userID
        });
        const booking = await Booking.create({
            name: `${name}'s Sigiriya tour`,
            booking_type: 'hotel',
            booking_date: new Date(),
            booking_time: '10:00',
            start_date: new Date(),
            end_date: new Date(Date.now() + 86400000),
            mobile_number: 771234567,
            payID: TAG,
            tourID: `${TAG}-tour`,
            payment_amount: 349,
            touristID: tourist.touristID,
            B_Id: `${TAG}-biz-${name}`
        });
        // A private message so the demo has something real to steal.
        await Chat.create({
            sender: tourist.touristID,
            senderModel: 'Tourist',
            bookingId: booking.bookingID,
            message: `${TAG} private message from ${name} - my passport number is X1234567`
        });
        const token = jwt.sign(
            { user: { userID, email: tourist.email, role: 'Tourist' } },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return { tourist, booking, token };
    };

    const alice = await make('Alice');
    const bob = await make('Bob');

    await mongoose.disconnect();

    console.log(
        [
            alice.token,
            alice.booking.bookingID,
            bob.token,
            bob.booking.bookingID,
            alice.tourist.touristID,
            bob.tourist.touristID
        ].join('|')
    );
};

run().catch(async (error) => {
    console.error('fixture setup failed:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
