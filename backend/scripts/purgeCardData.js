const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Payment = require('../model/Payment');
const CustomizePayment = require('../model/CustomizePayment');

dotenv.config();

const purgeCardData = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  await mongoose.connect(process.env.MONGO_URI);

  // PCI-DSS: card number, expiry, and CVV must not remain in stored documents.
  const [paymentResult, customizeResult] = await Promise.all([
    Payment.updateMany({ cardDetails: { $exists: true } }, { $unset: { cardDetails: '' } }),
    CustomizePayment.updateMany({ cardDetails: { $exists: true } }, { $unset: { cardDetails: '' } })
  ]);

  console.log(`Payment documents updated: ${paymentResult.modifiedCount}`);
  console.log(`CustomizePayment documents updated: ${customizeResult.modifiedCount}`);

  await mongoose.disconnect();
};

purgeCardData().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
