const HotelRoom = require ("../model/hotelRoom");
const { resolveBusinessIdentity, assertResourceOwner } = require('../middleware/bookingAccess');

// Security: only these fields may be written from a request body.
const HOTEL_ROOM_WRITABLE_FIELDS = [
    'name',
    'description',
    'quantity',
    'availability',
    'price_day',
    'price_month',
    'bed',
    'max_occupancy'
];

const pickHotelRoomFields = (source) => {
    const result = {};
    HOTEL_ROOM_WRITABLE_FIELDS.forEach((field) => {
        if (source[field] !== undefined) {
            result[field] = source[field];
        }
    });
    return result;
};



const addHotelRoom = async (req, res) => {
    try {
        const { name, description, quantity, availability, price_day, price_month, bed, max_occupancy } = req.body;

        // Security (V-24): the owning business is derived from the authenticated
        // account, never from req.body, so a caller cannot create a room for
        // another business by submitting a forged B_Id.
        const identity = await resolveBusinessIdentity(req.user);
        if (!identity) {
            return res.status(403).json({ message: 'You are not authorized to manage this resource' });
        }
        const B_Id = identity.B_Id;
        const userId = identity.userID;

        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        // Create new hotel room
        const hotelRoom = new HotelRoom({
            B_Id,
            name,
            description,
            quantity,
            availability,
            price_day,
            price_month,
            bed,
            max_occupancy,
            image: {
                data: req.file.buffer, // Store binary data
                contentType: req.file.mimetype
            },
            userId
        });

        await hotelRoom.save();
        res.status(201).json({ message: "Hotel Room added successfully", hotelRoom });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getAllHotelRoomByUserId = async (req, res) => {
    try {

        console.log("User IDhgfh\:", req.query.userId); 
        const rooms = await HotelRoom.find({userId:req.query.userId});

        // Convert image buffer to Base64
        const roomsWithImages = rooms.map(room => ({
            _id: room._id,
            HR_Id: room.HR_Id,
            B_Id: room.B_Id,
            name: room.name,
            description: room.description,
            quantity: room.quantity,
            availability: room.availability,
            price_day: room.price_day,
            price_month: room.price_month,
            bed: room.bed,
            max_occupancy: room.max_occupancy,
            image: room.image
                ? `data:${room.image.contentType};base64,${room.image.data.toString("base64")}`
                : null,
             
        }));

        res.status(200).json(roomsWithImages);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getAllHotelRoom = async (req, res) => {
    try {
        const rooms = await HotelRoom.find({});

        // Convert image buffer to Base64
        const roomsWithImages = rooms.map(room => ({
            _id: room._id,
            HR_Id: room.HR_Id,
            B_Id: room.B_Id,
            name: room.name,
            description: room.description,
            quantity: room.quantity,
            availability: room.availability,
            price_day: room.price_day,
            price_month: room.price_month,
            bed: room.bed,
            max_occupancy: room.max_occupancy,
            image: room.image
                ? `data:${room.image.contentType};base64,${room.image.data.toString("base64")}`
                : null,
             
        }));

        res.status(200).json(roomsWithImages);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


const getHotelRoom = async (req,res) => {
    try{
        const { HR_Id } = req.params.id;
        const room = await HotelRoom.findOne({ HR_Id: HR_Id });
        res.status(200).json(room);

    }catch (error){
        res.status(500).json ({message:error.message});
    }
}

const updateHotelRoom = async (req, res) => {
    try {
        const { id } = req.params; // HR_Id

        // Security (V-24): load the room and confirm the caller owns it before
        // changing anything. 404 if missing, 403 if owned by another business.
        const access = await assertResourceOwner(HotelRoom, { HR_Id: id }, req.user);
        if (!access.ok) {
            return res.status(access.status).json({ message: access.message });
        }

        // Security: whitelist writable fields so a client cannot set HR_Id, B_Id
        // ownership or any other field by adding it to the request body.
        const updateData = pickHotelRoomFields(req.body);

        // If an image is uploaded, handle the image data similarly to how it is handled for the vehicle update
        if (req.file) {
            updateData.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        // Update the hotel room based on HR_Id
        const updatedHotelRoom = await HotelRoom.findOneAndUpdate(
            { HR_Id: id },  // Query by HR_Id instead of _id
            updateData,
            { new: true, runValidators: true }  // Ensures the updated data is validated
        );

        // If the hotel room isn't found, return a 404 response
        if (!updatedHotelRoom) {
            return res.status(404).json({ message: "Hotel room not found" });
        }

        // If update is successful, return the updated hotel room data
        res.status(200).json({
            message: "Hotel room updated successfully",
            updatedHotelRoom
        });

    } catch (error) {
        // Handle errors, especially server errors
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const deleteHotelRoom= async (req,res) => {
    const HR_Id = req.params.id;
    try{
        // Security (V-24): only the owning business (or an Admin) may delete.
        const access = await assertResourceOwner(HotelRoom, { HR_Id: HR_Id }, req.user);
        if (!access.ok) {
            return res.status(access.status).json({ message: access.message });
        }

        const deleteHotelRoom = await HotelRoom.findOneAndDelete({ HR_Id: HR_Id });
        res.status(200).json(deleteHotelRoom);
    }catch(error){
        res.status(500).json({message:error.message});
    }
}

module.exports = {
    getAllHotelRoom,
    getHotelRoom,
    addHotelRoom,
    updateHotelRoom,
    deleteHotelRoom,
    getAllHotelRoomByUserId
};