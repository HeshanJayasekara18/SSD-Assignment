// TouristRoute.js
const express = require('express');
const router = express.Router();
const {
    getAllTour,
    getTour,
    addTour,
    updateTour,
    deleteTour
} = require('../controller/TourController');

const validate = require('../middleware/validate');
const { requiredText, optionalText, dateRule, idRule, body, param } = require('../middleware/validators');
const { authenticateUser, authorize } = require('../middleware/auth');

// Security (V-24): userID and touristID are deliberately NOT accepted here. A
// tour belongs to the tourist who creates it, and that identity is resolved from
// the authenticated account in the controller.
const createRules = [
    requiredText('destination', { max: 200, label: 'Destination' }),
    dateRule('start_date', { label: 'Start date' }),
    dateRule('end_date', { label: 'End date' }),
    body('end_date').custom((value, { req }) => {
        if (req.body.start_date && value < req.body.start_date) {
            throw new Error('End date must be on or after the start date');
        }
        return true;
    })
];

const updateRules = [
    optionalText('destination', { max: 200, label: 'Destination' }),
    dateRule('start_date', { optional: true, label: 'Start date' }),
    dateRule('end_date', { optional: true, label: 'End date' })
];

// Public read-only endpoints (intentionally unauthenticated).
router.get('/', getAllTour);
router.get('/:id', [idRule('id', param, { label: 'Tour ID' })], validate, getTour);

// Security (V-24): management operations require a login and an appropriate
// role. Per-resource ownership is verified in the controller.
router.post('/', authenticateUser, authorize('Tourist', 'Admin'), createRules, validate, addTour);

router.put(
    '/:id',
    authenticateUser,
    authorize('Tourist', 'Admin'),
    [idRule('id', param, { label: 'Tour ID' }), ...updateRules],
    validate,
    updateTour
);

router.delete(
    '/:id',
    authenticateUser,
    authorize('Tourist', 'Admin'),
    [idRule('id', param, { label: 'Tour ID' })],
    validate,
    deleteTour
);

module.exports = router;
