const express = require('express');
const router = express.Router();

const {
  Touristregister,
  getTouristDetails,
  getAllTourists,
  deleteTourist
} = require('../controller/TouristRegisterController');

const validate = require('../middleware/validate');
const {
  emailRule,
  passwordRule,
  requiredText,
  phoneRule,
  idRule,
  mongoIdRule,
  query
} = require('../middleware/validators');
const { authenticateUser, authorize } = require('../middleware/auth');

router.post(
  '/',
  [
    requiredText('fullname', { max: 100, label: 'Full name' }),
    emailRule('email'),
    passwordRule('password'),
    requiredText('country', { max: 100, label: 'Country' }),
    phoneRule('mobile_number')
  ],
  validate,
  Touristregister
);

router.get('/', [idRule('touristID', query, { label: 'Tourist ID' })], validate, getTouristDetails);

router.get('/all', authenticateUser, authorize('Admin'), getAllTourists);

router.delete(
  '/:id',
  authenticateUser,
  authorize('Admin'),
  [mongoIdRule('id')],
  validate,
  deleteTourist
);

module.exports = router;
