const Booking = require('../model/Booking');
const Tourist = require('../model/Tourist');
const BussinessAgent = require('../model/BussinessAgent');
const Bussiness = require('../model/Bussiness');

// Security (V-20): resolves the authenticated user's *domain* identity from the
// JWT, so chat sender identity is never taken from the request body.
//
// A booking has exactly two participants:
//   tourist   JWT.userID -> Tourist.userID       -> touristID == Booking.touristID
//   business  JWT.userID -> BussinessAgent.userID -> BA_Id -> Bussiness.B_Id == Booking.B_Id
//
// Returns { senderId, senderModel } or null when the user is neither.
const resolveChatIdentity = async (user) => {
    if (!user || !user.userID) {
        return null;
    }

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
// the booking before any chat message is written or read. Admins are allowed
// through for support purposes.
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

    const isTourist = identity.touristID && booking.touristID === identity.touristID;
    const isBusiness = identity.B_Id && booking.B_Id === identity.B_Id;

    if (!isTourist && !isBusiness) {
        return { ok: false, status: 403, message: 'You are not a participant in this conversation' };
    }

    return { ok: true, booking };
};

module.exports = { resolveChatIdentity, assertBookingParticipant };
