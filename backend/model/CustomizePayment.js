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
    type: String,
    required: true
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
  cardDetails: {
    cardNumber: {
      type: String,
      required: true
    },
    expiryDate: {
      type: String,
      required: true
    },
    cvv: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  cuscreatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CustomizePayment', CustomizePaymentSchema);