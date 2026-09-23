const mongoose = require ('mongoose');
 const { v4: uuidv4 } = require('uuid');
 
 const BussinessAgentSchema = mongoose.Schema({
     BA_Id: { type: String, required: true, unique: true,default: uuidv4 },
     fullname: { type: String, required: true },
     userAddress: { type: String, required: true },
     contact: { type: String, required: true },
     userID: { type: String, required: true },
 });
 
 const BussinessAgent = mongoose.model("BussinessAgent",BussinessAgentSchema);
 
 module.exports = BussinessAgent; 