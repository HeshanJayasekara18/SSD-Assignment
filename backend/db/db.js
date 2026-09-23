const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

console.log("MongoDB URI:", process.env.MONGO_URI); 

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Stop app if DB connection fails
  }
};+

// Import models here
require("../model/Booking");
require("../model/Tour");
require("../model/Tourist");
require("../model/User");
require("../model/Bussiness");
require("../model/BussinessAgent");
require("../model/Vehicle");
require("../model/hotelRoom");
require("../model/TourPackage");
require("../model/Payment");



module.exports = connectDB;