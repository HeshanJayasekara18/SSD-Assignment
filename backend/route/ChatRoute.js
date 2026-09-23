const express = require('express');
const router = express.Router();
const { saveChat, getChatByUserBooking ,getAllBookingByBussinessId} = require('../controller/ChatController');


router.post('/', saveChat);
router.get('/', getChatByUserBooking);
router.post('/bookingByBussinessId', getAllBookingByBussinessId); 

module.exports = router;
