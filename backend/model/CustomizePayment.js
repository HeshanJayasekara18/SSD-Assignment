// backend/models/CustomizePayment.js
const mongoose = require('mongoose');

const CustomizePaymentSchema = new mongoose.Schema({
  cuspayId: {
    type: String,
    required: true,
    unique: true,
    default: () => `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  phonenum: {
    type: Number,
    required: true
  },
  touristID: {
    type: String,
    required: true
  },
  UserID: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  bookingId: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    required: true,
    default: 'usd',
    lowercase: true,
    trim: true
  },
  stripeSessionId: {
    type: String,
    index: true
  },
  stripePaymentIntentId: {
    type: String,
    index: true
  },
  cardBrand: {
    type: String,
    default: ''
  },
  cardLast4: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  cuscreatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CustomizePayment', CustomizePaymentSchema);
