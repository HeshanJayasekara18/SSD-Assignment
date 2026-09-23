const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BookingSchema = mongoose.Schema({
    bookingID: { type: String, required: true, unique: true, default: uuidv4 },
    name: { type: String, required: true }, 
    booking_type: { type: String, required: true, enum: ['hotel', 'vehicle', 'guide'] },
    booking_date: { type: Date, required: true },
    booking_time: { type: String, required: true }, 
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    mobile_number: { type: Number, required: true },
    payID: { type: String, required: true },
    tourID: { type: String, required: true },
    payment_amount: { type: Number, required: true },
    touristID: { type: String, required: true },
    B_Id: { type: String, required: true },

    // Fields specific to hotel bookings
    hotel_booking: {
        hotel_name: String,
        room_type: String,
        number_of_rooms: Number,
        number_of_guests: Number
    },

    // Fields specific to vehicle bookings
    vehicle_booking: {
        vehicle_type: String,
        
        pickup_location: String,
        dropoff_location: String
    },

    // Fields specific to guide bookings
    guide_booking: {
        guide_name: String,
        guide_language: String,
        guide_experience: Number // in years
    }
});

const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking;
