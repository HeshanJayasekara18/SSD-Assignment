const Stripe = require('stripe');
const Payment = require('../model/Payment');
const CustomizePayment = require('../model/CustomizePayment');
const TourPackage = require('../model/TourPackage');
const Booking = require('../model/Booking');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const generateTransactionId = () => {
  return 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
};

const safePaymentResponse = (payment, extra = {}) => ({
  paymentId: payment.paymentId || payment.cuspayId,
  amount: payment.totalAmount,
  totalAmount: payment.totalAmount,
  currency: payment.currency,
  status: payment.status,
  cardBrand: payment.cardBrand || '',
  cardLast4: payment.cardLast4 || '',
  createdAt: payment.createdAt || payment.cuscreatedAt,
  ...extra
});

const getFrontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

const toStripeAmount = (amount) => Math.round(Number(amount) * 100);

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe is not configured');
  }

  return Stripe(process.env.STRIPE_SECRET_KEY);
};

const getCardDetailsFromPaymentIntent = async (stripe, paymentIntentId) => {
  if (!paymentIntentId) {
    return {};
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['latest_charge']
  });

  const charge = paymentIntent.latest_charge;
  const card = charge && charge.payment_method_details && charge.payment_method_details.card;

  return {
    stripePaymentIntentId: paymentIntent.id,
    cardBrand: card ? card.brand : '',
    cardLast4: card ? card.last4 : ''
  };
};

const markSessionPayment = async (session, status) => {
  const update = { status };

  if (status === 'Completed') {
    Object.assign(update, await getCardDetailsFromPaymentIntent(getStripeClient(), session.payment_intent));
  }

  const modelName = session.metadata && session.metadata.paymentModel;
  const Model = modelName === 'CustomizePayment' ? CustomizePayment : Payment;

  return Model.findOneAndUpdate(
    { stripeSessionId: session.id },
    update,
    { new: true }
  );
};

const createCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripeClient();

    const { packageId, bookingId, numberOfTravelers } = req.body;
    const travelers = Number(numberOfTravelers || 1);

    if ((!packageId && !bookingId) || (packageId && bookingId)) {
      return res.status(400).json({ success: false, message: 'Provide either packageId or bookingId' });
    }

    if (!Number.isInteger(travelers) || travelers < 1) {
      return res.status(400).json({ success: false, message: 'Number of travelers must be at least 1' });
    }

    const currency = 'usd';
    let payment;
    let lineItemName;
    let metadata;

    if (packageId) {
      const tourPackage = await TourPackage.findOne({
        $or: [{ tp_Id: packageId }, { packageId }]
      });

      if (!tourPackage) {
        return res.status(404).json({ success: false, message: 'Tour package not found' });
      }

      const amount = tourPackage.price * travelers;
      payment = await Payment.create({
        packageId: tourPackage.tp_Id,
        numberOfTravelers: travelers,
        totalAmount: amount,
        currency,
        status: 'Pending',
        paymentId: uuidv4(),
        transactionId: generateTransactionId()
      });
      lineItemName = tourPackage.name;
      metadata = { paymentModel: 'Payment', paymentId: payment.paymentId };
    } else {
      const bookingQuery = [{ bookingID: bookingId }];
      if (mongoose.Types.ObjectId.isValid(bookingId)) {
        bookingQuery.push({ _id: bookingId });
      }
      const booking = await Booking.findOne({ $or: bookingQuery });

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      // Security: the charge amount is calculated from the trusted booking record, not client input.
      payment = await CustomizePayment.create({
        fullName: booking.name,
        email: '',
        phonenum: booking.mobile_number,
        touristID: booking.touristID,
        UserID: booking.touristID,
        bookingId: booking.bookingID,
        totalAmount: booking.payment_amount,
        currency,
        status: 'Pending'
      });
      lineItemName = `${booking.booking_type} booking`;
      metadata = { paymentModel: 'CustomizePayment', paymentId: payment.cuspayId };
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: { name: lineItemName },
          unit_amount: toStripeAmount(payment.totalAmount)
        },
        quantity: 1
      }],
      metadata,
      success_url: `${getFrontendUrl()}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getFrontendUrl()}/payment-cancelled`
    });

    payment.stripeSessionId = session.id;
    await payment.save();

    res.status(201).json({
      success: true,
      url: session.url,
      sessionId: session.id,
      payment: safePaymentResponse(payment)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to create checkout session' });
  }
};

const stripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    // Security: only Stripe-signed webhook events may update payment status/card metadata.
    event = getStripeClient().webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    const session = event.data.object;

    if (event.type === 'checkout.session.completed') {
      await markSessionPayment(session, 'Completed');
    }

    if (event.type === 'checkout.session.expired') {
      await markSessionPayment(session, 'Failed');
    }

    if (event.type === 'payment_intent.payment_failed') {
      await Payment.findOneAndUpdate({ stripePaymentIntentId: session.id }, { status: 'Failed' });
      await CustomizePayment.findOneAndUpdate({ stripePaymentIntentId: session.id }, { status: 'Failed' });
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ received: false });
  }
};

const processPayment = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Raw card processing has been removed. Use /api/payment/create-checkout-session.'
  });
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });

    const safePayments = await Promise.all(payments.map(async (payment) => {
      const tourPackage = await TourPackage.findOne({ tp_Id: payment.packageId });
      return safePaymentResponse(payment, {
        packageId: payment.packageId,
        numberOfTravelers: payment.numberOfTravelers,
        transactionId: payment.transactionId,
        tourPackageName: tourPackage ? tourPackage.name : 'Unknown Package'
      });
    }));

    res.status(200).json({
      success: true,
      payments: safePayments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payments'
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

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
    res.status(500).json({
      success: false,
      message: 'Server error while deleting payment'
    });
  }
};

module.exports = {
  createCheckoutSession,
  stripeWebhook,
  processPayment,
  getAllPayments,
  deletePayment,
  safePaymentResponse
};
