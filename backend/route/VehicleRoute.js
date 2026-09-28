const express = require('express');
const { authenticateUser } = require("../middleware/auth");
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
    param
} = require('../middleware/validators');

// Note: these routes accept multipart/form-data, so numeric fields arrive as
// strings. The isInt/isFloat rules below coerce them via toInt()/toFloat().
const createRules = [
    idRule('B_Id', body, { label: 'Business ID' }),
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

router.post('/', authenticateUser, upload.single("image"), createRules, validate, addVehicle);

router.put(
    '/:id',
    authenticateUser,
    upload.single("image"),
    [idRule('id', param, { label: 'Vehicle ID' }), ...updateRules],
    validate,
    updateVehicle
);

router.delete(
    '/:id',
    authenticateUser,
    [idRule('id', param, { label: 'Vehicle ID' })],
    validate,
    deleteVehicle
);

router.post(
    '/getVehicleById',
    authenticateUser,
    getAllVehicleByUserId
);

module.exports = router;
