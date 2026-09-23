const express = require('express');
const router = express.Router();
const GuideProfileController = require('../controller/GuideProfileController');
const upload = require("../middleware/upload");

router.get('/', GuideProfileController.getDashboardStats);
router.post('/profile', upload.single("profileImage"), GuideProfileController.createProfile);
router.get('/profile/:guideId', GuideProfileController.getProfileByGuideId); 
router.put('/profile/:guideId', upload.single("profileImage"), GuideProfileController.updateProfile);
router.delete('/profile/:guideId', GuideProfileController.deleteProfile);
router.get('/profiles', GuideProfileController.getAllProfiles);


module.exports = router;
