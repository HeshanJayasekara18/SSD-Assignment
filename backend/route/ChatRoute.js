const express = require('express');
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const { saveChat, getChatByUserBooking ,getAllBookingByBussinessId} = require('../controller/ChatController');


router.post('/',authenticateUser, saveChat);
router.get('/', authenticateUser, getChatByUserBooking);
router.post('/bookingByBussinessId',authenticateUser, getAllBookingByBussinessId); 

module.exports = router;
