// Update TourGuideRoutes.js

const express = require('express');
const router = express.Router();
const { authenticateUser,authorize } = require("../middleware/auth");
const { 
  registerTourGuide, 
  loginTourGuide, 
  getAllTourGuides, 
  deleteTourGuide 
} = require('../controller/TourGuideController');

router.post('/register', registerTourGuide);
router.post('/login', loginTourGuide);
router.get('/all', getAllTourGuides);
router.delete('/:id', authenticateUser,authorize("Admin", "TourGuide"),deleteTourGuide);

module.exports = router;