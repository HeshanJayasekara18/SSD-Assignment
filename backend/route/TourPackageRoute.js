const express = require('express');
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const {
    createTourPackage,
    getAllTourPackages,
    getTourPackageById,
    updateTourPackage,
    deleteTourPackage


} = require('../controller/TourPackageController');

const upload = require("../middleware/upload");
router.get('/', getAllTourPackages);
router.get('/:id', getTourPackageById);
router.post('/',authenticateUser,upload.single("image"), createTourPackage);
router.put('/:id',authenticateUser,upload.single("image") ,updateTourPackage);
router.delete('/:id',authenticateUser, deleteTourPackage);
module.exports = router;
//compare this snippet from backend/route/TourPackageRoute.js: