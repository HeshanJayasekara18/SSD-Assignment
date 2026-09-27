const express = require('express');
const router = express.Router();
const GuideProfileController = require('../controller/GuideProfileController');
const upload = require("../middleware/upload");
const { authenticateUser } = require("../middleware/auth");

router.get('/', authenticateUser,GuideProfileController.getDashboardStats);
router.post('/profile', authenticateUser,upload.single("profileImage"), GuideProfileController.createProfile);
router.get('/profile/:guideId', GuideProfileController.getProfileByGuideId); 
router.put('/profile/:guideId',authenticateUser, upload.single("profileImage"), GuideProfileController.updateProfile);
router.delete('/profile/:guideId',authenticateUser, GuideProfileController.deleteProfile);
router.get('/profiles', GuideProfileController.getAllProfiles);


module.exports = router;
