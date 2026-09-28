const mongoose = require ('mongoose');
const { v4: uuidv4 } = require('uuid');

const TouristSchema = mongoose.Schema({
    touristID: { type: String, required: true, unique: true,default: uuidv4 },
    username: { type: String, },
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    country: { type: String },
    mobile_number: { type: Number },
    password: { 
        type: String, 
        required: function () { return this.authProvider === 'local'; }, 
        select: false 
    },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    userID: { type: String, required: true},
});

const Tourist = mongoose.model("Tourist",TouristSchema);

module.exports = Tourist; 
