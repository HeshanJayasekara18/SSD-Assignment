const express = require('express');
const router = express.Router();
const {
    getAllHotelRoom,
    getHotelRoom,
    addHotelRoom,
    updateHotelRoom,
    deleteHotelRoom,
    getAllHotelRoomByUserId
  } = require('../controller/HotelRoomController');

 const upload = require("../middleware/upload");

router.get('/', getAllHotelRoom);
router.get('/:id', getHotelRoom);    
router.post('/', upload.single("image") ,addHotelRoom);      
router.put('/:id',upload.single("image"),updateHotelRoom); 
router.delete('/:id', deleteHotelRoom); 
router.post('/getHotelRoomById', getAllHotelRoomByUserId); 

module.exports = router;