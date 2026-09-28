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

// Security (V-24): resolves the authenticated user's business identity. Used to
// decide who may create, update or delete vehicles and hotel rooms. The B_Id is
// looked up from the signed JWT through the database, never read from the
// request, so a forged B_Id in the body/query/params proves nothing.
const resolveBusinessIdentity = async (user) => {
    if (!user || !user.userID) {
        return null;
    }

    const agent = await BussinessAgent.findOne({ userID: user.userID });
    if (!agent) {
        return null;
    }

    const business = await Bussiness.findOne({ BA_Id: agent.BA_Id });
    if (!business) {
        return null;
    }

    return { B_Id: business.B_Id, BA_Id: agent.BA_Id, userID: user.userID };
};

// Security (V-24): loads a resource and confirms the caller may manage it.
//   - missing resource            -> 404
//   - caller has no business      -> 403
//   - resource owned by another   -> 403
// Admins bypass the ownership comparison, matching the existing application
// design where administrators manage commercial data.
const assertResourceOwner = async (Model, query, user, { ownerField = 'B_Id' } = {}) => {
    const resource = await Model.findOne(query);

    if (!resource) {
        return { ok: false, status: 404, message: 'Resource not found' };
    }

    if (user && user.role === 'Admin') {
        return { ok: true, resource };
    }

    const identity = await resolveBusinessIdentity(user);

    if (!identity) {
        return { ok: false, status: 403, message: 'You are not authorized to manage this resource' };
    }

    if (resource[ownerField] !== identity[ownerField]) {
        return { ok: false, status: 403, message: 'You are not authorized to manage this resource' };
    }

    return { ok: true, resource, identity };
};

module.exports = {
    resolveChatIdentity,
    assertBookingParticipant,
    resolveBusinessIdentity,
    assertResourceOwner
};
