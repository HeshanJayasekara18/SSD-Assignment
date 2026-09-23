// Update TourGuideRoutes.js

const express = require('express');
const router = express.Router();
const { 
  registerTourGuide, 
  loginTourGuide, 
  getAllTourGuides, 
  deleteTourGuide 
} = require('../controller/TourGuideController');

router.post('/register', registerTourGuide);
router.post('/login', loginTourGuide);
router.get('/all', getAllTourGuides);
router.delete('/:id', deleteTourGuide);

module.exports = router;