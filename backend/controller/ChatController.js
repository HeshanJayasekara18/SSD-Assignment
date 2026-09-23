const Chat = require('../model/Chat');
const Booking = require('../model/Booking');


const saveChat = async (req, res) => {
    try {
        const { sender, senderModel, bookingId, message } = req.body;

        if (!sender || !senderModel || !bookingId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const chat = new Chat({
            sender,
            senderModel,
            bookingId,
            message, 
        });

        const savedChat = await chat.save();

        res.status(201).json({ message: "Chat saved successfully", chat: savedChat });
    } catch (error) {
        console.error("Save chat error:", error);
        res.status(500).json({ message: error.message });
    }
};


const getChatByUserBooking = async (req, res) => {
    try {
        const { userId, senderModel, bookingId } = req.query;

        if (!userId || !senderModel || !bookingId) {
            return res.status(400).json({ message: "Missing query parameters" });
        }

        const chats = await Chat.find({
            sender: userId,
            bookingId: bookingId
        }).sort({ timestamp: 1 }); // oldest first

        res.status(200).json({ chats });
    } catch (error) {
        console.error("Get chat error:", error);
        res.status(500).json({ message: error.message });
    }
};

const getAllBookingByBussinessId = async (req, res) => {
    try {
        const { B_Id } = req.body.params;
        console.log("B_Id", B_Id);

        const bookings = await Booking.find({B_Id:B_Id}); 
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    saveChat,
    getChatByUserBooking,
    getAllBookingByBussinessId
};
