// TouristRoute.js
const express = require('express');
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const {
    getAllTour,
    getTour,
    addTour,
    updateTour,
    deleteTour
} = require('../controller/TourController');

router.get('/', getAllTour);
router.get('/:id', getTour);    
router.post('/', authenticateUser,addTour);      
router.put('/:id', authenticateUser,updateTour); 
router.delete('/:id',authenticateUser, deleteTour); 

module.exports = router;