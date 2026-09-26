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

const validate = require('../middleware/validate');
const {
    requiredText,
    optionalText,
    phoneRule,
    positiveNumber,
    positiveInt,
    enumRule,
    dateRule,
    idRule,
    body,
    param
} = require('../middleware/validators');
const { authenticateUser, authorize } = require('../middleware/auth');

const BOOKING_TYPES = ['hotel', 'vehicle', 'guide'];

// Nested sub-documents are validated per booking type.
const nestedRules = [
    optionalText('hotel_booking.hotel_name', { max: 150 }),
    optionalText('hotel_booking.room_type', { max: 100 }),
    positiveInt('hotel_booking.number_of_rooms', { min: 1, max: 100, optional: true }),
    positiveInt('hotel_booking.number_of_guests', { min: 1, max: 100, optional: true }),

    optionalText('vehicle_booking.vehicle_type', { max: 100 }),
    optionalText('vehicle_booking.pickup_location', { max: 250 }),
    optionalText('vehicle_booking.dropoff_location', { max: 250 }),

    optionalText('guide_booking.guide_name', { max: 150 }),
    optionalText('guide_booking.guide_language', { max: 100 }),
    positiveInt('guide_booking.guide_experience', { min: 0, max: 80, optional: true })
];

const createRules = [
    requiredText('name', { max: 150, label: 'Name' }),
    enumRule('booking_type', BOOKING_TYPES, { label: 'Booking type' }),
    dateRule('booking_date', { label: 'Booking date' }),
    requiredText('booking_time', { max: 20, label: 'Booking time' }),
    dateRule('start_date', { label: 'Start date' }),
    dateRule('end_date', { label: 'End date' }),
    body('end_date').custom((value, { req }) => {
        if (req.body.start_date && value < req.body.start_date) {
            throw new Error('End date must be on or after the start date');
        }
        return true;
    }),
    phoneRule('mobile_number'),
    requiredText('payID', { max: 100, label: 'Payment ID' }),
    idRule('tourID', body, { label: 'Tour ID' }),
    // Security: amount is range-bound here, but the authoritative charge amount
    // is still read from the stored booking in PaymentController.
    positiveNumber('payment_amount', { max: 10000000, label: 'Payment amount' }),
    idRule('touristID', body, { label: 'Tourist ID' }),
    idRule('B_Id', body, { label: 'Business ID' }),
    ...nestedRules
];

// On update every field is optional, but each is still type/range checked.
const updateRules = [
    optionalText('name', { max: 150, label: 'Name' }),
    enumRule('booking_type', BOOKING_TYPES, { optional: true, label: 'Booking type' }),
    dateRule('booking_date', { optional: true, label: 'Booking date' }),
    optionalText('booking_time', { max: 20, label: 'Booking time' }),
    dateRule('start_date', { optional: true, label: 'Start date' }),
    dateRule('end_date', { optional: true, label: 'End date' }),
    phoneRule('mobile_number', { optional: true }),
    // payment_amount, touristID, B_Id, payID and tourID are deliberately absent:
    // they are immutable after creation (see BOOKING_IMMUTABLE_AFTER_CREATE).
    ...nestedRules
];

router.get('/', authenticateUser, getAllBooking);

// `/report` is declared before `/:id` so it is not captured by the param route.
router.post('/report', authenticateUser, authorize('Admin'), generateReport);

router.get('/:id', authenticateUser, [idRule('id', param, { label: 'Booking ID' })], validate, getBooking);

router.post('/', authenticateUser, createRules, validate, addBooking);

router.put(
    '/:id',
    authenticateUser,
    [idRule('id', param, { label: 'Booking ID' }), ...updateRules],
    validate,
    updateBooking
);

router.delete(
    '/:id',
    authenticateUser,
    [idRule('id', param, { label: 'Booking ID' })],
    validate,
    deleteBooking
);

module.exports = router;
