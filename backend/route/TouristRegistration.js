const express = require('express');
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");


const {
  Touristregister,
  getTouristDetails,
  getAllTourists,
  deleteTourist
} = require('../controller/TouristRegisterController');

router.post('/', Touristregister);
router.get('/',authenticateUser, getTouristDetails);
router.get('/all', authenticateUser,getAllTourists);
router.delete('/:id', authenticateUser,deleteTourist);

module.exports = router;