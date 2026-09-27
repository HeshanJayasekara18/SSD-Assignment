const Tour = require('../model/Tour');
const Tourist = require('../model/Tourist');

// Security (V-24): only these fields may be written from a request body.
// tourID, userID and touristID are ownership/identity and are set by the server.
const TOUR_WRITABLE_FIELDS = ['destination', 'start_date', 'end_date'];

const pickTourFields = (source) => {
    const result = {};
    TOUR_WRITABLE_FIELDS.forEach((field) => {
        if (source[field] !== undefined) {
            result[field] = source[field];
        }
    });
    return result;
};

// Security (V-24): a Tour is a tourist's own trip plan, so ownership is resolved
// from the authenticated tourist rather than a business. The touristID is looked
// up from the signed JWT, never read from the request.
const resolveTouristIdentity = async (user) => {
    if (!user || !user.userID) {
        return null;
    }
    const tourist = await Tourist.findOne({ userID: user.userID });
    if (!tourist) {
        return null;
    }
    return { touristID: tourist.touristID, userID: user.userID };
};

const assertTourOwner = async (tourID, user) => {
    const tour = await Tour.findOne({ tourID });

    if (!tour) {
        return { ok: false, status: 404, message: 'Tour not found' };
    }

    if (user && user.role === 'Admin') {
        return { ok: true, tour };
    }

    const identity = await resolveTouristIdentity(user);

    if (!identity || tour.touristID !== identity.touristID) {
        return { ok: false, status: 403, message: 'You are not authorized to manage this resource' };
    }

    return { ok: true, tour, identity };
};

const getAllTour = async (req, res) => {
    try {
        const tours = await Tour.find({});
        res.status(200).json(tours);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTour = async (req, res) => {
    try {
        const tourID = req.params.id;
        const tour = await Tour.findOne({ tourID: tourID });

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        res.status(200).json(tour);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addTour = async (req, res) => {
    try {
        // Security (V-24): owner identity comes from the authenticated account,
        // so a caller cannot create a tour on another tourist's behalf.
        const identity = await resolveTouristIdentity(req.user);
        if (!identity) {
            return res.status(403).json({ message: 'You are not authorized to manage this resource' });
        }

        const newTour = await Tour.create({
            ...pickTourFields(req.body),
            userID: identity.userID,
            touristID: identity.touristID
        });

        res.status(201).json(newTour);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTour = async (req, res) => {
    const tourID = req.params.id;
    try {
        // Security (V-24): 404 if it does not exist, 403 if it belongs to
        // someone else.
        const access = await assertTourOwner(tourID, req.user);
        if (!access.ok) {
            return res.status(access.status).json({ message: access.message });
        }

        const updatedTour = await Tour.findOneAndUpdate(
            { tourID: tourID },
            pickTourFields(req.body),
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedTour);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTour = async (req, res) => {
    const tourID = req.params.id;
    try {
        // Security (V-24): only the owning tourist (or an Admin) may delete.
        const access = await assertTourOwner(tourID, req.user);
        if (!access.ok) {
            return res.status(access.status).json({ message: access.message });
        }

        const deletedTour = await Tour.findOneAndDelete({ tourID: tourID });
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
