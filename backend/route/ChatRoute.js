const express = require('express');
const router = express.Router();
const { saveChat, getChatByUserBooking, getAllBookingByBussinessId } = require('../controller/ChatController');

const validate = require('../middleware/validate');
const { requiredText, idRule, body, query } = require('../middleware/validators');
const { authenticateUser } = require('../middleware/auth');

// Security (V-20): `sender`, `senderModel` and `userId` are deliberately NOT
// accepted here. Sender identity is resolved from the authenticated token in the
// controller, so any such field in the request is stripped by `validate` before
// the controller runs and cannot be used to impersonate another participant.
router.post(
    '/',
    authenticateUser,
    [
        idRule('bookingId', body, { label: 'Booking ID' }),
        requiredText('message', { max: 2000, label: 'Message' })
    ],
    validate,
    saveChat
);

router.get(
    '/',
    authenticateUser,
    [idRule('bookingId', query, { label: 'Booking ID' })],
    validate,
    getChatByUserBooking
);

// B_Id is optional and honoured only for Admin callers; a business account's own
// B_Id is derived from its authenticated identity.
router.post(
    '/bookingByBussinessId',
    authenticateUser,
    [body('B_Id').optional({ nullable: true }).isString().trim().matches(/^[A-Za-z0-9_-]+$/)
        .withMessage('Business ID contains invalid characters')],
    validate,
    getAllBookingByBussinessId
);

module.exports = router;
