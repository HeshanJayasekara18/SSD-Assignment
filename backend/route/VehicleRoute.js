const express = require('express');
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
router.post("/", upload.single("image"), addVehicle);
router.put("/:id", upload.single("image"), updateVehicle);
router.delete('/:id', deleteVehicle); 
router.post('/getVehicleById', getAllVehicleByUserId);

module.exports = router;