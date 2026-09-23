// TouristController.js
const Tourist = require("../model/Tourist");

const getAllTourist = async (req, res) => {
    try {
        const tourists = await Tourist.find({});
        res.status(200).json(tourists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getTourist = async (req, res) => {
    try {
        const { id } = req.params;
        const tourist = await Tourist.findOne({ touristID: id });
        
        if (!tourist) {
            return res.status(404).json({ message: 'Tourist not found' });
        }
        
        res.status(200).json(tourist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const addTourist = async (req, res) => {
    try {  
        // Create a new tourist
        const tourist = await Tourist.create(req.body);
        res.status(201).json(tourist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateTourist = async (req, res) => {
    try {
        const { id } = req.params;
        const updateTourist = await Tourist.findOneAndUpdate(
            { touristID: id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updateTourist) {
            return res.status(404).json({ message: 'Tourist not found' });
        }

        res.status(200).json(updateTourist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteTourist = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTourist = await Tourist.findOneAndDelete({ touristID: id });

        if (!deletedTourist) {
            return res.status(404).json({ message: 'Tourist not found' });
        }

        res.status(200).json(deletedTourist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getAllTourist,
    getTourist,
    addTourist,
    updateTourist,
    deleteTourist
};