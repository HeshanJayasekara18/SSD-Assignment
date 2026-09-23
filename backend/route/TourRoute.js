// TouristRoute.js
const express = require('express');
const router = express.Router();
const {
    getAllTour,
    getTour,
    addTour,
    updateTour,
    deleteTour
} = require('../controller/TourController');

router.get('/', getAllTour);
router.get('/:id', getTour);    
router.post('/', addTour);      
router.put('/:id', updateTour); 
router.delete('/:id', deleteTour); 

module.exports = router;