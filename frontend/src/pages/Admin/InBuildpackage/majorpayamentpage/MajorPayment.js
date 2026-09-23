import React, { useState } from 'react';
import './MajorPayment.css';

const MajorPayment = () => {
  const [formData, setFormData] = useState({
    userID: '',
    amount: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({
      text: 'Direct card collection has been removed. Start payments from a package or booking checkout.',
      type: 'error'
    });
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
            <input type="text" name="userID" value={formData.userID} onChange={handleChange} required placeholder="Enter user ID" />
          </div>

          <div className="form-group">
            <label>Amount</label>
            <div className="amount-input">
              <span className="currency-symbol">$</span>
              <input type="text" name="amount" value={formData.amount} onChange={handleChange} required placeholder="0.00" />
            </div>
          </div>

          <div className="form-group">
            <label>Billing Address</label>
            <input type="text" name="billingAddress" value={formData.billingAddress} onChange={handleChange} placeholder="Street address" />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
            </div>

            <div className="form-group half">
              <label>State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
            </div>
          </div>

          <div className="form-group">
            <label>Zip Code</label>
            <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="Zip Code" />
          </div>

          <button type="submit" className="submit-button">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default MajorPayment;
