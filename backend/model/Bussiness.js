const mongoose = require ('mongoose');
const { v4: uuidv4 } = require('uuid');
 
const BussinessSchema = mongoose.Schema({
    B_Id: { type: String, required: true, unique: true,default: uuidv4 },
    BA_Id: { type: String, required: true },
    businessName: { type: String, required: true },
    businessAddress: { type: String, required: true },
    description: { type: String, required: true },
    bussinessType: { type: String, required: true },
    businessFile: { type: String },
});

const Bussiness = mongoose.model("Bussiness",BussinessSchema);//table name

module.exports = Bussiness; 