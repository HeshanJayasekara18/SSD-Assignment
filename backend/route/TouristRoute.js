// TouristRoute.js
//const { authenticateUser, authorize } = require('../middleware/auth');

const express = require('express');
const router = express.Router();
const {
    getAllTourist,
    getTourist,
    addTourist,
    updateTourist,
    deleteTourist
} = require('../controller/TouristController');

router.get('/', getAllTourist);
router.get('/:id', getTourist);    
router.post('/', addTourist);      
router.put('/:id', updateTourist); 
router.delete('/:id', deleteTourist);
//router.get('/', authenticateUser, authorize('Admin'), getAllTourist); 

module.exports = router;