import React, { useState } from 'react';
import './MajorPayment.css';

const MajorPayment = () => {
  const [formData, setFormData] = useState({
    userID: '',
    amount: '',
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData({ ...formData, [name]: formatted });
    } 
    // Format expiry date with slash
    else if (name === 'expiryDate') {
      let formatted = value.replace(/\//g, '');
      if (formatted.length > 2) {
        formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
      }
      setFormData({ ...formData, [name]: formatted });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Payment processed successfully!', type: 'success' });
        // Reset form after successful submission
        setFormData({
          userID: '',
          amount: '',
          cardholderName: '',
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          billingAddress: '',
          city: '',
          state: '',
          zipCode: ''
        });
      } else {
        setMessage({ text: data.message || 'Payment processing failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h2>Payment Information</h2>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>User ID</label>
            <input
              type="text"
              name="userID"
              value={formData.userID}
              onChange={handleChange}
              required
              placeholder="Enter user ID"
            />
          </div>

          <div className="form-group">
            <label>Amount</label>
            <div className="amount-input">
              <span className="currency-symbol">$</span>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              name="cardholderName"
              value={formData.cardholderName}
              onChange={handleChange}
              required
              placeholder="Name as it appears on card"
            />
          </div>

          <div className="form-group">
            <label>Card Number</label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              required
              placeholder="1234 5678 9012 3456"
              maxLength="19"
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Expiry Date</label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                placeholder="MM/YY"
                maxLength="5"
              />
            </div>

            <div className="form-group half">
              <label>CVV</label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                required
                placeholder="123"
                maxLength="4"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Billing Address</label>
            <input
              type="text"
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleChange}
              required
              placeholder="Street address"
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="City"
              />
            </div>

            <div className="form-group half">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="State"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Zip Code</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              required
              placeholder="Zip Code"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Processing...' : 'Submit Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MajorPayment;