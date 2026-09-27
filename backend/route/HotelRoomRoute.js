const express = require('express');
const router = express.Router();
const {
    getAllHotelRoom,
    getHotelRoom,
    addHotelRoom,
    updateHotelRoom,
    deleteHotelRoom,
    getAllHotelRoomByUserId
  } = require('../controller/HotelRoomController');

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
    requiredText('name', { max: 150, label: 'Room name' }),
    requiredText('description', { max: 1000, label: 'Description' }),
    positiveInt('quantity', { min: 1, max: 10000, label: 'Quantity' }),
    requiredText('availability', { max: 50, label: 'Availability' }),
    positiveNumber('price_day', { max: 10000000, label: 'Daily price' }),
    positiveNumber('price_month', { max: 100000000, label: 'Monthly price' }),
    positiveInt('bed', { min: 1, max: 50, label: 'Beds' }),
    positiveInt('max_occupancy', { min: 1, max: 100, label: 'Max occupancy' })
];

const updateRules = [
    optionalText('name', { max: 150, label: 'Room name' }),
    optionalText('description', { max: 1000, label: 'Description' }),
    positiveInt('quantity', { min: 1, max: 10000, optional: true, label: 'Quantity' }),
    optionalText('availability', { max: 50, label: 'Availability' }),
    positiveNumber('price_day', { max: 10000000, optional: true, label: 'Daily price' }),
    positiveNumber('price_month', { max: 100000000, optional: true, label: 'Monthly price' }),
    positiveInt('bed', { min: 1, max: 50, optional: true, label: 'Beds' }),
    positiveInt('max_occupancy', { min: 1, max: 100, optional: true, label: 'Max occupancy' })
];

router.get('/', getAllHotelRoom);

router.get('/:id', [idRule('id', param, { label: 'Room ID' })], validate, getHotelRoom);

// Security (V-24): management operations require a login AND an appropriate
// role. Per-resource ownership is checked in the controller.
router.post('/', authenticateUser, authorize('Bussiness', 'Admin'), upload.single("image"), createRules, validate, addHotelRoom);

router.put(
    '/:id',
    authenticateUser,
    authorize('Bussiness', 'Admin'),
    upload.single("image"),
    [idRule('id', param, { label: 'Room ID' }), ...updateRules],
    validate,
    updateHotelRoom
);

router.delete(
    '/:id',
    authenticateUser,
    authorize('Bussiness', 'Admin'),
    [idRule('id', param, { label: 'Room ID' })],
    validate,
    deleteHotelRoom
);

router.post(
    '/getHotelRoomById',
    authenticateUser,
    // The handler reads req.query.userId, so validate it there.
    [idRule('userId', query, { label: 'User ID' })],
    validate,
    getAllHotelRoomByUserId
);

module.exports = router;
