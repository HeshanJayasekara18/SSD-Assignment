const express = require('express');
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const {
    getAllBooking,
    getBooking,
    addBooking,
    updateBooking,
    deleteBooking,
    generateReport
} = require('../controller/BookingController');

// GET all bookings
router.get('/',authenticateUser, getAllBooking);

// GET a booking by ID
router.get('/:id',authenticateUser, getBooking);

// POST a new booking
router.post('/', authenticateUser,addBooking);

// PUT (update) a booking by ID
router.put('/:id', authenticateUser,updateBooking);

// DELETE a booking by ID
router.delete('/:id', authenticateUser,deleteBooking);

// POST to generate a report
router.post('/report',authenticateUser, generateReport);

module.exports = router;
