const express = require('express');
const router = express.Router();
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
router.post('/',upload.single("image"), createTourPackage);
router.put('/:id',upload.single("image") ,updateTourPackage);
router.delete('/:id', deleteTourPackage);
module.exports = router;
//compare this snippet from backend/route/TourPackageRoute.js: