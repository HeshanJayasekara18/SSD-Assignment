const mongoose = require ('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = mongoose.Schema({
    userID: { type: String, required: true,default: uuidv4 },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true },
});

const User = mongoose.model("User",UserSchema);

module.exports = User; 
