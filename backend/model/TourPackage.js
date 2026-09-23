const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const TourPackageSchema = mongoose.Schema({
    tp_Id: { type: String, required: true, unique: true, default: uuidv4 },
    packageId: {
        type: String,
        required: true,
        trim: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      destination: {
        type: String,
        required: true,
        trim: true
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      },
      tourGuideName: {
        type: String,
        required: true,
        trim: true//trim removes white spaces
      },
      tourType: {
        type: String,
        required: true,
        enum: ['Adventure', 'Beach', 'Cultural', 'Family', 'Luxury', 'Wildlife', 'Cruise', 'Hiking', 'Historical', 'Honeymoon']
      },
      description: {
        type: String,
        required: true
      },
      image: {
        data: Buffer, 
        contentType: String
      }
      
      


});
const TourPackage = mongoose.model("TourPackage", TourPackageSchema);//table name
module.exports = TourPackage;