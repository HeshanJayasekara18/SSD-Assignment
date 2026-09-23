// TouristRoute.js
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

module.exports = router;