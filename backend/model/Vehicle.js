const mongoose = require ('mongoose');
const { v4: uuidv4 } = require('uuid');

const VehicleSchema = mongoose.Schema({
    V_Id: { type: String, required: true, unique: true,default: uuidv4 },
    B_Id: { type: String, required: true },
    modelName: { type: String, required: true },
    seats: { type: Number, required: true },
    fuelType: { type: String, required: true },
    transmission: { type: String, required: true },
    doors: { type: Number, required: true },
    status: { type: String, required: true },
    priceDay: { type: Number, required: true },
    priceMonth: { type: Number, required: true },
    image: { 
        data: Buffer, 
        contentType: String 
      },
    userId: { type: String },   
});
const Vehicle = mongoose.model("Vehicle",VehicleSchema);
module.exports = Vehicle; 