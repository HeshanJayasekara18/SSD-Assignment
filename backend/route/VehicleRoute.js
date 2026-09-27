const express = require('express');
const { authenticateUser } = require("../middleware/auth");
const router = express.Router();
const {
    getAllVehicle,
    getVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getAllVehicleByUserId
  } = require('../controller/VehicleController');

  const upload = require("../middleware/upload");

router.get('/', getAllVehicle); 
router.get('/:id', getVehicle);  
router.post("/",authenticateUser, upload.single("image"), addVehicle);
router.put("/:id", authenticateUser,upload.single("image"), updateVehicle);
router.delete('/:id', authenticateUser,deleteVehicle); 
router.post('/getVehicleById',authenticateUser, getAllVehicleByUserId);

module.exports = router;