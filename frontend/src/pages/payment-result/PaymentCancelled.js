import React from 'react';
import { Link } from 'react-router-dom';

const PaymentCancelled = () => (
  <div style={{ maxWidth: 560, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
    <h1>Payment Cancelled</h1>
    <p>No payment was taken. You can return and try again when you are ready.</p>
    <Link to="/Tourist/package">Back to packages</Link>
  </div>
);

export default PaymentCancelled;
