const express = require('express');
const router = express.Router();
const {
    createTourPackage,
    getAllTourPackages,
    getTourPackageById,
    updateTourPackage,
    deleteTourPackage
} = require('../controller/TourPackageController');

const upload = require("../middleware/upload");
const validate = require('../middleware/validate');
const { requiredText, optionalText, positiveNumber, enumRule, dateRule, idRule, body, param } =
    require('../middleware/validators');
const { authenticateUser, authorize } = require('../middleware/auth');

// Matches the enum on the TourPackage model.
const TOUR_TYPES = ['Adventure', 'Beach', 'Cultural', 'Family', 'Luxury',
    'Wildlife', 'Cruise', 'Hiking', 'Historical', 'Honeymoon'];

// Note: multipart/form-data route - numeric fields arrive as strings and are
// coerced by toFloat().
const createRules = [
    requiredText('packageId', { max: 100, label: 'Package ID' }),
    requiredText('name', { max: 150, label: 'Name' }),
    requiredText('destination', { max: 200, label: 'Destination' }),
    positiveNumber('price', { max: 10000000, label: 'Price' }),
    dateRule('startDate', { label: 'Start date' }),
    dateRule('endDate', { label: 'End date' }),
    body('endDate').custom((value, { req }) => {
        if (req.body.startDate && value < req.body.startDate) {
            throw new Error('End date must be on or after the start date');
        }
        return true;
    }),
    requiredText('tourGuideName', { max: 150, label: 'Tour guide name' }),
    enumRule('tourType', TOUR_TYPES, { label: 'Tour type' }),
    requiredText('description', { max: 2000, label: 'Description' })
];

const updateRules = [
    optionalText('packageId', { max: 100, label: 'Package ID' }),
    optionalText('name', { max: 150, label: 'Name' }),
    optionalText('destination', { max: 200, label: 'Destination' }),
    positiveNumber('price', { max: 10000000, optional: true, label: 'Price' }),
    dateRule('startDate', { optional: true, label: 'Start date' }),
    dateRule('endDate', { optional: true, label: 'End date' }),
    optionalText('tourGuideName', { max: 150, label: 'Tour guide name' }),
    enumRule('tourType', TOUR_TYPES, { optional: true, label: 'Tour type' }),
    optionalText('description', { max: 2000, label: 'Description' })
];

// Public read-only endpoints: the package catalogue is browsed by anonymous
// visitors on the landing page, so these stay open by design.
router.get('/', getAllTourPackages);
router.get('/:id', [idRule('id', param, { label: 'Package ID' })], validate, getTourPackageById);

// Security (V-24): tour packages carry no business owner in the schema and are
// managed from the Admin screens, so authorisation is role-based: only an Admin
// may create, update or delete them.
router.post(
    '/',
    authenticateUser,
    authorize('Admin'),
    upload.single("image"),
    createRules,
    validate,
    createTourPackage
);

router.put(
    '/:id',
    authenticateUser,
    authorize('Admin'),
    upload.single("image"),
    [idRule('id', param, { label: 'Package ID' }), ...updateRules],
    validate,
    updateTourPackage
);

router.delete(
    '/:id',
    authenticateUser,
    authorize('Admin'),
    [idRule('id', param, { label: 'Package ID' })],
    validate,
    deleteTourPackage
);

module.exports = router;
