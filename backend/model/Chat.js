const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
  sender: {
      type:String,
      required: true
    },
    senderModel: {
      type: String,
      required: true,
      enum: ['Business', 'Tourist']
    },
    bookingId: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  });

  
  module.exports = mongoose.model('Chat', chatSchema);