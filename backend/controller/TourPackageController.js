const TourPackage = require('../model/TourPackage');

// Security (V-24): only these fields may be written from a request body. tp_Id
// is the identifier and is never client-writable. Tour packages carry no
// business owner in the schema and are managed from the Admin screens, so
// authorisation for them is role-based (Admin) rather than ownership-based -
// enforced by authorize('Admin') on the routes.
const PACKAGE_WRITABLE_FIELDS = [
    'packageId',
    'name',
    'destination',
    'price',
    'startDate',
    'endDate',
    'tourGuideName',
    'tourType',
    'description'
];

const pickPackageFields = (source) => {
    const result = {};
    PACKAGE_WRITABLE_FIELDS.forEach((field) => {
        if (source[field] !== undefined) {
            result[field] = source[field];
        }
    });
    return result;
};

const createTourPackage = async (req, res, next) => {
    try {
        const { packageId, name, destination, price, startDate, endDate, tourGuideName, tourType, description } = req.body;
        
        // Image validation
        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        // Create new package
        const tourPackage = new TourPackage({
            packageId,
            name,
            destination,
            price,
            startDate,
            endDate,
            tourGuideName,
            tourType,
            description,
            image: {
                data: req.file.buffer, // Store binary data
                contentType: req.file.mimetype
            }
        });

        await tourPackage.save();
        res.status(201).json({ message: "Tour Package added successfully", tourPackage });
    } catch (error) {
        next(error); // Handled cleanly by centralized errorHandler middleware
    }
};

const getAllTourPackages = async (req, res, next) => {
    try {
        const tourPackages = await TourPackage.find();
    
        // Convert image buffer to Base64
        const tourPackagewithImages = tourPackages.map(tourPackage => ({
            tp_Id: tourPackage.tp_Id,
            packageId: tourPackage.packageId,
            name: tourPackage.name,
            destination: tourPackage.destination,
            price: tourPackage.price,
            startDate: tourPackage.startDate,
            endDate: tourPackage.endDate,
            tourGuideName: tourPackage.tourGuideName,
            tourType: tourPackage.tourType,
            description: tourPackage.description,
            
            image: tourPackage.image 
                ? `data:${tourPackage.image.contentType};base64,${tourPackage.image.data.toString("base64")}` 
                : null,
        }));

        res.status(200).json(tourPackagewithImages);
    } catch (error) {
        next(error);
    }
};

// Get a single tour package by ID
const getTourPackageById = async (req, res, next) => {
    try {
        // The update and delete routes address packages by tp_Id, and that is
        // what the frontend sends, so look up by tp_Id here too. findById()
        // expected a Mongo _id and threw a cast error on a tp_Id.
        const tourPackage = await TourPackage.findOne({ tp_Id: req.params.id });
        if (!tourPackage) {
            return res.status(404).json({ message: "Tour package not found" });
        }
        res.status(200).json(tourPackage);
    } catch (error) {
        next(error);
    }
};

const updateTourPackage = async (req, res, next) => {
    try {
        const { id } = req.params; 
        // Security (V-24): whitelist writable fields so tp_Id and
        // other server-controlled properties cannot be changed by
        // adding them to the request body.
        const updateData = pickPackageFields(req.body);

        if (req.file) {
            updateData.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }
        
        const updateTourPackage = await TourPackage.findOneAndUpdate(
            { tp_Id: id },  
            updateData,
            { new: true, runValidators: true }
        );

        if (!updateTourPackage) {
            return res.status(404).json({ message: "Package not found" });
        }

        res.status(200).json({ message: "Package updated successfully", updateTourPackage });
    } catch (error) {
        next(error);
    }
};

// Delete a tour package by ID
const deleteTourPackage = async (req, res, next) => {
    const tp_Id = req.params.id;
    try {
        const deleteTourPackage = await TourPackage.findOneAndDelete({ tp_Id: tp_Id });
        if (!deleteTourPackage) {
            return res.status(404).json({ message: "Package not found" });
        }
        res.status(200).json({ message: "Package deleted successfully", deleteTourPackage });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTourPackage,
    getAllTourPackages,
    getTourPackageById,
    updateTourPackage,
    deleteTourPackage
};
