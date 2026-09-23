const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const feedbackSchema = new mongoose.Schema({
  feedbackId: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['TourGuide', 'HotelRoom', 'Vehicle'] 
  },
  touristID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tourist',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String
  },
  adminResponse: {    
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);