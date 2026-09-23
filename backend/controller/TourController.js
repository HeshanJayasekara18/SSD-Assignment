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
        const newTour = await Tour.create(req.body); // Renamed variable to 'newTour'
        res.status(200).json(newTour);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTour = async (req, res) => {
    const tourID = req.params.id;
    const body = req.body;
    try {
        const updatedTour = await Tour.findOneAndUpdate(
            { tourID: tourID },
            body,
            { new: true, runValidators: true }
        ); // Fixed model reference and variable name
        res.status(200).json(updatedTour);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTour = async (req, res) => {
    const tourID = req.params.id;
    try {
        const deletedTour = await Tour.findOneAndDelete({ tourID: tourID }); // Renamed variable to 'deletedTour'
        res.status(200).json(deletedTour);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllTour,
    getTour,
    addTour,
    updateTour,
    deleteTour
};