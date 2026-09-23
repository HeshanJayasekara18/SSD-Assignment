const mongoose = require ('mongoose');
const { v4: uuidv4 } = require('uuid');

const HotelRoomSchema = mongoose.Schema({
    HR_Id: { type: String, required: true, unique: true,default: uuidv4 },
    B_Id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    availability: { type: String, required: true },
    price_day: { type: Number, required: true },
    price_month: { type: Number, required: true },
    bed: { type: Number, required: true },
    max_occupancy: { type: Number, required: true },
    image: { 
        data: Buffer, 
        contentType: String 
    },
    userId: { type: String },  
});

const HotelRoom = mongoose.model("HotelRoom",HotelRoomSchema);

module.exports = HotelRoom; 