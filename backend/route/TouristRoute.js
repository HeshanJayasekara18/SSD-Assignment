// TouristRoute.js
const express = require('express');
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const {
    getAllTourist,
    getTourist,
    addTourist,
    updateTourist,
    deleteTourist
} = require('../controller/TouristController');

router.get('/', getAllTourist);
router.get('/:id', getTourist);    
router.post('/',authenticateUser, addTourist);      
router.put('/:id', authenticateUser,updateTourist); 
router.delete('/:id', authenticateUser,deleteTourist); 

module.exports = router;