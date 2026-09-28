const mongoose = require ('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = mongoose.Schema({
    userID: { type: String, required: true,default: uuidv4 },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8, select: false},
    // Security: role is constrained to a fixed set and is never taken from the
    // request body - it is derived from the registration endpoint used.
    role: { type: String, required: true, enum: ['Tourist', 'Bussiness', 'TourGuide', 'Admin'] },
    email: { type: String, required: true },
});

const User = mongoose.model("User",UserSchema);

module.exports = User; 
