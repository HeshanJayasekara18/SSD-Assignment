// Update TourGuideRoutes.js

const express = require('express');
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const { 
  registerTourGuide, 
  loginTourGuide, 
  getAllTourGuides, 
  deleteTourGuide 
} = require('../controller/TourGuideController');

router.post('/register', registerTourGuide);
router.post('/login', loginTourGuide);
router.get('/all', getAllTourGuides);
router.delete('/:id', authenticateUser,deleteTourGuide);

module.exports = router;