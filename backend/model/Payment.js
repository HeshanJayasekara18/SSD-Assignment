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
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
