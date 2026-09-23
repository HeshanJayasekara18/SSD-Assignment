// backend/route/CustomizePaymentRoute.js

const express = require('express');
const router = express.Router();
const CustomizePaymentController = require('../controller/CustomizePaymentController');

// Create new payment
router.post('/', CustomizePaymentController.createPayment);

// Get all payments
router.get('/', CustomizePaymentController.getAllPayments);

// Get a payment by ID
router.get('/:id', CustomizePaymentController.getPaymentById);

// Update payment status
router.patch('/:id/status', CustomizePaymentController.updatePaymentStatus);

// Delete a payment
router.delete('/:id', CustomizePaymentController.deletePayment);

module.exports = router;
