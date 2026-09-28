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

        const tourist = await Tourist.findOne({
            touristID: id
        });

        if (!tourist) {
            return res.status(404).json({
                message: "Tourist not found"
            });
        }

        if (tourist.userID !== req.user.userID) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        return res.status(200).json(tourist);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const addTourist = async (req, res) => {
    try {  
        // Create a new tourist
        const tourist = await Tourist.create(req.body);
        const touristObj = tourist.toObject();
        delete touristObj.password;
        res.status(201).json(touristObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateTourist = async (req, res) => {
    try {
        const { id } = req.params;

        const tourist = await Tourist.findOne({
            touristID: id
        });

        if (!tourist) {
            return res.status(404).json({
                message: "Tourist not found"
            });
        }

        if (tourist.userID !== req.user.userID) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const updateData = {
            ...req.body
        };

        // Identity/ownership fields must not be changed by client
        delete updateData.userID;
        delete updateData.touristID;

        const updatedTourist = await Tourist.findOneAndUpdate(
            {
                touristID: id,
                userID: req.user.userID
            },
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json(updatedTourist);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const deleteTourist = async (req, res) => {
    try {
        const { id } = req.params;

        const tourist = await Tourist.findOne({
            touristID: id
        });

        if (!tourist) {
            return res.status(404).json({
                message: "Tourist not found"
            });
        }

        if (tourist.userID !== req.user.userID) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        await Tourist.findOneAndDelete({
            touristID: id,
            userID: req.user.userID
        });

        return res.status(200).json({
            message: "Tourist deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getAllTourist,
    getTourist,
    addTourist,
    updateTourist,
    deleteTourist
};