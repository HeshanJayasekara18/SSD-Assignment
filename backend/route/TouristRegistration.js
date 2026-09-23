const express = require('express');
const router = express.Router();

const {
  Touristregister,
  getTouristDetails,
  getAllTourists,
  deleteTourist
} = require('../controller/TouristRegisterController');

router.post('/', Touristregister);
router.get('/', getTouristDetails);
router.get('/all', getAllTourists);
router.delete('/:id', deleteTourist);

module.exports = router;