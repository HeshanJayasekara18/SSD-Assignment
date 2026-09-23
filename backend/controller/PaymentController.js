const Payment = require('../model/Payment');
const TourPackage = require('../model/TourPackage');
const { v4: uuidv4 } = require('uuid');  // Correct import for uuidv4

// Function to generate a unique transaction ID
const generateTransactionId = () => {
  return 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
};

const processPayment = async (req, res) => {
  try {
    console.log('Received payment data:', req.body);

    const {
      fullName,
      email,
      phone,
      packageId,
      numberOfTravelers,
      totalAmount,
      cardDetails,
    } = req.body;

    if (!fullName || !email || !phone || !packageId || !numberOfTravelers || !totalAmount || !cardDetails) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (numberOfTravelers < 1) {
      return res.status(400).json({ success: false, message: 'Number of travelers must be at least 1' });
    }

    if (!cardDetails.cardNumber || !/^\d{13,19}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
      return res.status(400).json({ success: false, message: 'Invalid card number' });
    }

    if (!cardDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      return res.status(400).json({ success: false, message: 'Invalid expiry date format (MM/YY)' });
    }

    if (!cardDetails.cvv || !/^\d{3,4}$/.test(cardDetails.cvv)) {
      return res.status(400).json({ success: false, message: 'Invalid CVV' });
    }

    const tourPackage = await TourPackage.findOne({ tp_Id: packageId });

    if (!tourPackage) {
      return res.status(404).json({ success: false, message: 'Tour package not found' });
    }

    const expectedAmount = tourPackage.price * numberOfTravelers;
    if (Math.abs(totalAmount - expectedAmount) > 0.01) {
      return res.status(400).json({ success: false, message: 'Total amount does not match the expected price' });
    }

    // Create new payment with a generated transactionId and unique paymentId
    const payment = new Payment({
      fullName,
      email,
      phone,
      packageId,
      numberOfTravelers,
      totalAmount,
      cardDetails,
      status: 'Completed',
      paymentId: uuidv4(),  // Ensure a new paymentId is generated here
      transactionId: generateTransactionId(), // Generate unique transactionId
    });

    await payment.save();

    console.log('Payment saved:', payment);

    res.status(200).json({
      success: true,
      payment: { paymentId: payment.paymentId }, // Correct paymentId in response
      message: 'Payment processed successfully',
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during payment processing',
      error: error.message,
    });
  }
};



const getAllPayments = async (req, res) => {
  try {
    // Fetch all payments from the database
    const payments = await Payment.find().sort({ createdAt: -1 });
    
    // Populate tour package names if needed
    const populatedPayments = await Promise.all(payments.map(async (payment) => {
      try {
        const tourPackage = await TourPackage.findOne({ tp_Id: payment.packageId });
        
        // Create a plain object from the payment document
        const paymentObj = payment.toObject();
        
        // Add tour package name if found
        if (tourPackage) {
          paymentObj.tourPackageName = tourPackage.name;
        }
        
        return paymentObj;
      } catch (err) {
        console.error(`Error fetching tour package for payment ${payment.paymentId}:`, err);
        const paymentObj = payment.toObject();
        paymentObj.tourPackageName = 'Unknown Package';
        return paymentObj;
      }
    }));
    
    res.status(200).json({
      success: true,
      payments: populatedPayments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payments',
      error: error.message
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment ID is required' 
      });
    }

    const payment = await Payment.findOne({ paymentId });
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    await Payment.deleteOne({ paymentId });
    
    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting payment',
      error: error.message
    });
  }
};

module.exports = {
  
   processPayment,
   getAllPayments,
   deletePayment,};

