const express = require('express');
const router = express.Router();
const { saveChat, getChatByUserBooking, getAllBookingByBussinessId } = require('../controller/ChatController');

const validate = require('../middleware/validate');
const { requiredText, enumRule, idRule, body, query } = require('../middleware/validators');
const { authenticateUser } = require('../middleware/auth');

const SENDER_MODELS = ['Business', 'Tourist'];

router.post(
    '/',
    authenticateUser,
    [
        idRule('sender', body, { label: 'Sender' }),
        enumRule('senderModel', SENDER_MODELS, { label: 'Sender model' }),
        idRule('bookingId', body, { label: 'Booking ID' }),
        requiredText('message', { max: 2000, label: 'Message' })
    ],
    validate,
    saveChat
);

router.get(
    '/',
    authenticateUser,
    [
        idRule('userId', query, { label: 'User ID' }),
        enumRule('senderModel', SENDER_MODELS, { label: 'Sender model', location: query }),
        idRule('bookingId', query, { label: 'Booking ID' })
    ],
    validate,
    getChatByUserBooking
);

router.post(
    '/bookingByBussinessId',
    authenticateUser,
    [idRule('B_Id', body, { label: 'Business ID' })],
    validate,
    getAllBookingByBussinessId
);

module.exports = router;
