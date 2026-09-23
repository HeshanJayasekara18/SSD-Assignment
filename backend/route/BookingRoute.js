const express = require('express');
const router = express.Router();
const {
    getAllBooking,
    getBooking,
    addBooking,
    updateBooking,
    deleteBooking,
    generateReport
} = require('../controller/BookingController');

// GET all bookings
router.get('/', getAllBooking);

// GET a booking by ID
router.get('/:id', getBooking);

// POST a new booking
router.post('/', addBooking);

// PUT (update) a booking by ID
router.put('/:id', updateBooking);

// DELETE a booking by ID
router.delete('/:id', deleteBooking);

// POST to generate a report
router.post('/report', generateReport);

module.exports = router;
