const express = require('express');
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const {
    register,
    getBussinessDetails,
    loginBussiness
  } = require('../controller/BussinessRegisterController');

const validate = require('../middleware/validate');
const { loginLimiter } = require("../middleware/rateLimiter");
const {
    emailRule,
    passwordRule,
    requiredText,
    optionalText,
    phoneRule,
    idRule,
    body,
    query
} = require('../middleware/validators');

// Security: `role` is deliberately NOT accepted here. It is set to 'Bussiness'
// by the controller, so a client cannot self-register as an Admin.
router.post(
    '/',
    [
        emailRule('email'),
        passwordRule('password'),
        requiredText('fullName', { max: 100, label: 'Full name' }),
        optionalText('userAddress', { max: 250, label: 'Address' }),
        phoneRule('contact'),
        requiredText('businessName', { max: 150, label: 'Business name' }),
        requiredText('businessAddress', { max: 250, label: 'Business address' }),
        optionalText('description', { max: 1000, label: 'Description' }),
        requiredText('businessType', { max: 50, label: 'Business type' }),
        optionalText('businessFile', { max: 500, label: 'Business file' })
    ],
    validate,
    register
);

router.get('/', authenticateUser,[idRule('B_Id', query, { label: 'Business ID' })], validate, getBussinessDetails);

router.post(
    '/login',
    loginLimiter,
    [
        emailRule('email'),
        body('password')
            .exists({ checkNull: true }).withMessage('Password is required')
            .bail()
            .isString().withMessage('Password must be a string')
    ],
    validate,
    loginBussiness
);

module.exports = router;
