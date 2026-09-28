import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => (
  <div style={{ maxWidth: 560, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
    <h1>Payment Successful</h1>
    <p>Your payment was completed securely with Stripe.</p>
    <Link to="/Tourist/package">Back to packages</Link>
  </div>
);

export default PaymentSuccess;
