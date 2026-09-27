const express = require('express');
const router = express.Router();
const {
    getAllVehicle,
    getVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getAllVehicleByUserId
  } = require('../controller/VehicleController');

const upload = require("../middleware/upload");
const validate = require('../middleware/validate');
const {
    requiredText,
    optionalText,
    positiveNumber,
    positiveInt,
    idRule,
    body,
    param,
    query
} = require('../middleware/validators');
const { authenticateUser, authorize } = require('../middleware/auth');

// Note: these routes accept multipart/form-data, so numeric fields arrive as
// strings. The isInt/isFloat rules below coerce them via toInt()/toFloat().
// Security (V-24): B_Id and userId are deliberately NOT accepted here. The
// owning business is derived from the authenticated account in the controller,
// so a forged ownership field in the request is stripped by `validate`.
const createRules = [
    requiredText('modelName', { max: 100, label: 'Model name' }),
    positiveInt('seats', { min: 1, max: 100, label: 'Seats' }),
    requiredText('fuelType', { max: 50, label: 'Fuel type' }),
    requiredText('transmission', { max: 50, label: 'Transmission' }),
    positiveInt('doors', { min: 1, max: 10, label: 'Doors' }),
    requiredText('status', { max: 50, label: 'Status' }),
    positiveNumber('priceDay', { max: 10000000, label: 'Daily price' }),
    positiveNumber('priceMonth', { max: 100000000, label: 'Monthly price' })
];

const updateRules = [
    optionalText('modelName', { max: 100, label: 'Model name' }),
    positiveInt('seats', { min: 1, max: 100, optional: true, label: 'Seats' }),
    optionalText('fuelType', { max: 50, label: 'Fuel type' }),
    optionalText('transmission', { max: 50, label: 'Transmission' }),
    positiveInt('doors', { min: 1, max: 10, optional: true, label: 'Doors' }),
    optionalText('status', { max: 50, label: 'Status' }),
    positiveNumber('priceDay', { max: 10000000, optional: true, label: 'Daily price' }),
    positiveNumber('priceMonth', { max: 100000000, optional: true, label: 'Monthly price' })
];

router.get('/', getAllVehicle);

router.get('/:id', [idRule('id', param, { label: 'Vehicle ID' })], validate, getVehicle);

// Security (V-24): management operations require a login AND an appropriate
// role. Per-resource ownership is checked in the controller.
router.post('/', authenticateUser, authorize('Bussiness', 'Admin'), upload.single("image"), createRules, validate, addVehicle);

router.put(
    '/:id',
    authenticateUser,
    authorize('Bussiness', 'Admin'),
    upload.single("image"),
    [idRule('id', param, { label: 'Vehicle ID' }), ...updateRules],
    validate,
    updateVehicle
);

router.delete(
    '/:id',
    authenticateUser,
    authorize('Bussiness', 'Admin'),
    [idRule('id', param, { label: 'Vehicle ID' })],
    validate,
    deleteVehicle
);

router.post(
    '/getVehicleById',
    authenticateUser,
    // The handler reads req.query.userId, so validate it there.
    [idRule('userId', query, { label: 'User ID' })],
    validate,
    getAllVehicleByUserId
);

module.exports = router;
