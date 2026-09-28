const CustomizePayment = require('../model/CustomizePayment');
const { safePaymentResponse } = require('./PaymentController');

exports.createPayment = async (req, res) => {
    return res.status(410).json({
        success: false,
        message: 'Raw card processing has been removed. Use /api/payment/create-checkout-session.'
    });
};

exports.getAllPayments = async (req, res) => {
    try {
        const payments = await CustomizePayment.find().sort({ cuscreatedAt: -1 });
        res.status(200).json({
            success: true,
            payments: payments.map((payment) => safePaymentResponse(payment, {
                bookingId: payment.bookingId,
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching payments' });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const payment = await CustomizePayment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json({ success: true, payment: safePaymentResponse(payment, { bookingId: payment.bookingId }) });
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching payment' });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    return res.status(405).json({
        success: false,
        message: 'Payment status is updated only by verified Stripe webhooks.'
    });
};

exports.deletePayment = async (req, res) => {
    try {
        const deletedPayment = await CustomizePayment.findByIdAndDelete(req.params.id);
        if (!deletedPayment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while deleting payment' });
    }
};
