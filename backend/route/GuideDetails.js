const express = require('express');
const router = express.Router();
const GuideProfileController = require('../controller/GuideProfileController');
const upload = require("../middleware/upload");

const validate = require('../middleware/validate');
const {
    requiredText,
    optionalText,
    positiveNumber,
    positiveInt,
    enumRule,
    phoneRule,
    mongoIdRule,
    body,
    param
} = require('../middleware/validators');
const { authenticateUser } = require('../middleware/auth');

// Matches the enum on the TourGuideProfile model (model/GuideDetails.js).
const GENDERS = ['male', 'female', 'other'];

// Note: multipart/form-data route - numeric fields arrive as strings and are
// coerced by toInt()/toFloat(). languages/specializationList/locations are
// comma-separated strings that the controller splits.
// gender/bio/description are required by the model, so they are required here.
const profileRules = [
    enumRule('gender', GENDERS, { label: 'Gender' }),
    phoneRule('phoneNumber'),
    positiveInt('age', { min: 18, max: 100, label: 'Age' }),
    positiveInt('experience', { min: 0, max: 80, label: 'Experience' }),
    requiredText('languages', { max: 300, label: 'Languages' }),
    requiredText('specializationList', { max: 300, label: 'Specializations' }),
    requiredText('bio', { max: 2000, label: 'Bio' }),
    requiredText('locations', { max: 300, label: 'Locations' }),
    requiredText('description', { max: 2000, label: 'Description' }),
    positiveNumber('amount', { max: 10000000, label: 'Amount' })
];

router.get('/', authenticateUser, GuideProfileController.getDashboardStats);

router.post(
    '/profile',
    authenticateUser,
    upload.single("profileImage"),
    [mongoIdRule('guideId', body), ...profileRules],
    validate,
    GuideProfileController.createProfile
);

router.get(
    '/profile/:guideId',
    [mongoIdRule('guideId', param)],
    validate,
    GuideProfileController.getProfileByGuideId
);

router.put(
    '/profile/:guideId',
    authenticateUser,
    upload.single("profileImage"),
    [
        mongoIdRule('guideId', param),
        enumRule('gender', GENDERS, { optional: true, label: 'Gender' }),
        phoneRule('phoneNumber', { optional: true }),
        positiveInt('age', { min: 18, max: 100, optional: true, label: 'Age' }),
        positiveInt('experience', { min: 0, max: 80, optional: true, label: 'Experience' }),
        optionalText('languages', { max: 300, label: 'Languages' }),
        optionalText('specializationList', { max: 300, label: 'Specializations' }),
        optionalText('bio', { max: 2000, label: 'Bio' }),
        optionalText('locations', { max: 300, label: 'Locations' }),
        optionalText('description', { max: 2000, label: 'Description' }),
        positiveNumber('amount', { max: 10000000, optional: true, label: 'Amount' })
    ],
    validate,
    GuideProfileController.updateProfile
);

router.delete(
    '/profile/:guideId',
    authenticateUser,
    [mongoIdRule('guideId', param)],
    validate,
    GuideProfileController.deleteProfile
);

router.get('/profiles', GuideProfileController.getAllProfiles);

module.exports = router;
