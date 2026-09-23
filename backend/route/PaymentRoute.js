const express = require('express');
const router = express.Router();
const { processPayment,getAllPayments,deletePayment } = require('../controller/PaymentController');

router.post('/process', processPayment);
router.get('/all', getAllPayments);
router.delete('/:paymentId', deletePayment);

module.exports = router;
