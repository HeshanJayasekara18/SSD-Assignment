const Chat = require('../model/Chat');
const Booking = require('../model/Booking');
const Bussiness = require('../model/Bussiness');
const BussinessAgent = require('../model/BussinessAgent');
const { resolveChatIdentity, assertBookingParticipant } = require('../middleware/bookingAccess');

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

        const chats = await Chat.find({ bookingId }).sort({ timestamp: 1 }); // oldest first

        res.status(200).json({ chats });
    } catch (error) {
        console.error("Get chat error:", error);
        res.status(500).json({ message: 'Unable to load chat messages' });
    }
};

// Security (V-20): the business whose bookings are returned is derived from the
// authenticated agent, so a caller cannot list another business's bookings by
// passing a different B_Id.
const getAllBookingByBussinessId = async (req, res) => {
    try {
        if (req.user && req.user.role === 'Admin' && req.body.B_Id) {
            const bookings = await Booking.find({ B_Id: req.body.B_Id });
            return res.status(200).json(bookings);
        }

        const agent = await BussinessAgent.findOne({ userID: req.user && req.user.userID });
        if (!agent) {
            return res.status(403).json({ message: 'Not a business account' });
        }

        const business = await Bussiness.findOne({ BA_Id: agent.BA_Id });
        if (!business) {
            return res.status(403).json({ message: 'No business linked to this account' });
        }

        const bookings = await Booking.find({ B_Id: business.B_Id });
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Get bookings by business error:", error);
        res.status(500).json({ message: 'Unable to load bookings' });
    }
};

module.exports = {
    saveChat,
    getChatByUserBooking,
    getAllBookingByBussinessId
};
