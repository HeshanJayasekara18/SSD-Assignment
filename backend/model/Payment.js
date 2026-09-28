const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PaymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),  // Generate unique UUID for paymentId
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'TXN' + Date.now() + Math.floor(Math.random() * 1000), // Unique transaction ID
  },
  fullName: {
    type: String
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  packageId: {
    type: String,
    required: true
  },
  numberOfTravelers: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
