// TouristRoute.js
//const { authenticateUser, authorize } = require('../middleware/auth');

const express = require('express');
const router = express.Router();
const { authenticateUser,authorize } = require("../middleware/auth");
const {
    getAllTourist,
    getTourist,
    addTourist,
    updateTourist,
    deleteTourist
} = require('../controller/TouristController');

router.get('/', getAllTourist);
router.get('/:id', getTourist);    
router.post('/',authenticateUser, ("Admin, Tourist"),addTourist);      
router.put('/:id', authenticateUser,("Admin, Tourist"),updateTourist); 
router.delete('/:id', authenticateUser,authorize("Admin, Tourist"),deleteTourist); 

module.exports = router;