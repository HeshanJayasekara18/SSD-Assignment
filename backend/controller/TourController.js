const Tour = require('../model/Tour');

const getAllTour = async (req, res) => {
    try {
        const tours = await Tour.find({}); // Fixed model and variable name
        res.status(200).json(tours);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTour = async (req, res) => {
    try {
        const tourID = req.params.id;
        const tour = await Tour.findOne({ tourID: tourID }); // Fixed model reference
        res.status(200).json(tour);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addTour = async (req, res) => {
    try {
        const tourData = {
            ...req.body,

            // Owner must come from authenticated identity
            userID: req.user.userID
        };

        const newTour = await Tour.create(tourData);

        return res.status(201).json(newTour);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const updateTour = async (req, res) => {
    try {
        const tourID = req.params.id;

        const tour = await Tour.findOne({
            tourID: tourID
        });

        if (!tour) {
            return res.status(404).json({
                message: "Tour not found"
            });
        }

        if (tour.userID !== req.user.userID) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const updateData = {
            ...req.body
        };

        // Protected fields cannot be modified by the client
        delete updateData.userID;
        delete updateData.tourID;

        const updatedTour = await Tour.findOneAndUpdate(
            {
                tourID: tourID,
                userID: req.user.userID
            },
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json(updatedTour);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const deleteTour = async (req, res) => {
    try {
        const tourID = req.params.id;

        const tour = await Tour.findOne({
            tourID: tourID
        });

        if (!tour) {
            return res.status(404).json({
                message: "Tour not found"
            });
        }

        if (tour.userID !== req.user.userID) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        await Tour.findOneAndDelete({
            tourID: tourID,
            userID: req.user.userID
        });

        return res.status(200).json({
            message: "Tour deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getAllTour,
    getTour,
    addTour,
    updateTour,
    deleteTour
};