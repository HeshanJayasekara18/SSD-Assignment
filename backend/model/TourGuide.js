const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const tourGuideSchema = new mongoose.Schema({
  guideId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4
  },
  guideName: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },  
}, { timestamps: true });

module.exports = mongoose.model('TourGuide', tourGuideSchema)