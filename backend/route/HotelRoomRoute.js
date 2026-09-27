const express = require('express');
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
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
router.post('/', authenticateUser,upload.single("image") ,addHotelRoom);      
router.put('/:id',authenticateUser,upload.single("image"),updateHotelRoom); 
router.delete('/:id', authenticateUser,deleteHotelRoom); 
router.post('/getHotelRoomById',authenticateUser, getAllHotelRoomByUserId); 

module.exports = router;