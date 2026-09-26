const { body, query, param } = require('express-validator');

// Security: shared validation chains. Every rule normalises (trim/escape-free
// but type-coerced) and constrains length/range/enum so malformed or malicious
// values are rejected with 400 before touching the database.

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
const TEXT_MAX = 500;
const NAME_MAX = 100;

const emailRule = (field = 'email') =>
    body(field)
        .exists({ checkNull: true }).withMessage('Email is required')
        .bail()
        .isString().withMessage('Email must be a string')
        .bail()
        .trim()
        .normalizeEmail()
        .isEmail().withMessage('A valid email is required')
        .isLength({ max: 254 }).withMessage('Email is too long');

// Security: password length is validated on the RAW password here, before the
// controller hashes it. Checking minlength on the User model instead would only
// ever measure the 60-character bcrypt hash and always pass.
const passwordRule = (field = 'password') =>
    body(field)
        .exists({ checkNull: true }).withMessage('Password is required')
        .bail()
        .isString().withMessage('Password must be a string')
        .bail()
        .isLength({ min: PASSWORD_MIN, max: PASSWORD_MAX })
        .withMessage(`Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters`);

const requiredText = (field, { max = NAME_MAX, label } = {}) =>
    body(field)
        .exists({ checkNull: true }).withMessage(`${label || field} is required`)
        .bail()
        .isString().withMessage(`${label || field} must be a string`)
        .bail()
        .trim()
        .isLength({ min: 1, max }).withMessage(`${label || field} must be 1-${max} characters`);

const optionalText = (field, { max = TEXT_MAX, label } = {}) =>
    body(field)
        .optional({ nullable: true })
        .isString().withMessage(`${label || field} must be a string`)
        .bail()
        .trim()
        .isLength({ max }).withMessage(`${label || field} must be at most ${max} characters`);

const phoneRule = (field = 'mobile_number', { optional = false } = {}) => {
    const chain = optional
        ? body(field).optional({ nullable: true })
        : body(field).exists({ checkNull: true }).withMessage('Phone number is required').bail();

    return chain
        .customSanitizer((value) => (typeof value === 'number' ? String(value) : value))
        .isString().withMessage('Phone number must be a string')
        .bail()
        .trim()
        .matches(/^\+?[0-9]{7,15}$/).withMessage('Phone number must be 7-15 digits, optionally starting with +');
};

const positiveNumber = (field, { max = 1000000, optional = false, label } = {}) => {
    const chain = optional
        ? body(field).optional({ nullable: true })
        : body(field).exists({ checkNull: true }).withMessage(`${label || field} is required`).bail();

    return chain
        .isFloat({ min: 0, max }).withMessage(`${label || field} must be a number between 0 and ${max}`)
        .toFloat();
};

const positiveInt = (field, { min = 1, max = 10000, optional = false, label } = {}) => {
    const chain = optional
        ? body(field).optional({ nullable: true })
        : body(field).exists({ checkNull: true }).withMessage(`${label || field} is required`).bail();

    return chain
        .isInt({ min, max }).withMessage(`${label || field} must be an integer between ${min} and ${max}`)
        .toInt();
};

const enumRule = (field, values, { optional = false, label, location = body } = {}) => {
    const chain = optional
        ? location(field).optional({ nullable: true })
        : location(field).exists({ checkNull: true }).withMessage(`${label || field} is required`).bail();

    return chain
        .isString().withMessage(`${label || field} must be a string`)
        .bail()
        .trim()
        .isIn(values).withMessage(`${label || field} must be one of: ${values.join(', ')}`);
};

const dateRule = (field, { optional = false, label } = {}) => {
    const chain = optional
        ? body(field).optional({ nullable: true })
        : body(field).exists({ checkNull: true }).withMessage(`${label || field} is required`).bail();

    return chain
        .isISO8601().withMessage(`${label || field} must be a valid ISO-8601 date`)
        .toDate();
};

// Identifiers in this codebase are uuid v4 strings (uuidv4 defaults on the models).
const idRule = (field, location = param, { label } = {}) =>
    location(field)
        .exists({ checkNull: true }).withMessage(`${label || field} is required`)
        .bail()
        .isString().withMessage(`${label || field} must be a string`)
        .bail()
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage(`${label || field} is invalid`)
        // Security: constrain to a safe character set so the value cannot carry
        // operators or objects into a Mongo query.
        .matches(/^[A-Za-z0-9_-]+$/).withMessage(`${label || field} contains invalid characters`);

const mongoIdRule = (field, location = param) =>
    location(field)
        .exists({ checkNull: true }).withMessage(`${field} is required`)
        .bail()
        .isMongoId().withMessage(`${field} must be a valid id`);

module.exports = {
    body,
    query,
    param,
    emailRule,
    passwordRule,
    requiredText,
    optionalText,
    phoneRule,
    positiveNumber,
    positiveInt,
    enumRule,
    dateRule,
    idRule,
    mongoIdRule,
    limits: { PASSWORD_MIN, PASSWORD_MAX, TEXT_MAX, NAME_MAX }
};
