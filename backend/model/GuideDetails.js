const mongoose = require('mongoose');


const tourGuideProfileSchema = new mongoose.Schema({
  guide: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourGuide',
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 18
  },
  profileImage: { 
    data: Buffer, 
    contentType: String 
  } ,
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  languages: {
    type: [String],
    required: true
  },
  specializationList: {
    type: [String],
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  locations: {
    type: [String],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0 
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('TourGuideProfile', tourGuideProfileSchema);
