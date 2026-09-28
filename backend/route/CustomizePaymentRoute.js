// backend/route/CustomizePaymentRoute.js

const express = require('express');
const router = express.Router();
const CustomizePaymentController = require('../controller/CustomizePaymentController');
const { authenticateUser, authorize } = require('../middleware/auth');

// Create new payment
router.post('/', CustomizePaymentController.createPayment);

// Get all payments
router.get('/', authenticateUser, authorize('Admin'), CustomizePaymentController.getAllPayments);

// Get a payment by ID
router.get('/:id', authenticateUser, authorize('Admin'), CustomizePaymentController.getPaymentById);

// Update payment status
router.patch('/:id/status', authenticateUser, authorize('Admin'), CustomizePaymentController.updatePaymentStatus);

// Delete a payment
router.delete('/:id', authenticateUser, authorize('Admin'), CustomizePaymentController.deletePayment);

module.exports = router;
