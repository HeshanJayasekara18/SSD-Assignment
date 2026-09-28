const express = require('express');
const router = express.Router();
const { createCheckoutSession, processPayment, getAllPayments, deletePayment } = require('../controller/PaymentController');
const { authenticateUser, authorize } = require('../middleware/auth');

router.post('/create-checkout-session', createCheckoutSession);
router.post('/process', processPayment);
router.get('/all', authenticateUser, authorize('Admin'), getAllPayments);
router.delete('/:paymentId', authenticateUser, authorize('Admin'), deletePayment);

module.exports = router;
