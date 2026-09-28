import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PackagePayment.css';

const PackagePayment = ({ packageData }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    numberOfTravelers: 1,
  });

  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (packageData && packageData.price) {
      const price = packageData.price * formData.numberOfTravelers;
      setTotalPrice(isNaN(price) ? 0 : price);
    }
  }, [packageData, formData.numberOfTravelers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError(null);
  };

  const handleTravelerChange = (change) => {
    const newCount = Math.max(1, Number(formData.numberOfTravelers) + change);
    setFormData({
      ...formData,
      numberOfTravelers: newCount,
    });
  };

  const handleTravelerInput = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setFormData({
        ...formData,
        numberOfTravelers: value,
      });
    } else if (e.target.value === '') {
      setFormData({
        ...formData,
        numberOfTravelers: '',
      });
    }
  };

  const handleTravelerBlur = () => {
    if (formData.numberOfTravelers === '' || formData.numberOfTravelers < 1) {
      setFormData({
        ...formData,
        numberOfTravelers: 1,
      });
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    return true;
  };

  const processPayment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const packageId = packageData.tp_Id || packageData.packageId;

      // Security: only send identifiers/counts. Stripe Checkout collects card data.
      const response = await axios.post('http://localhost:4000/api/payment/create-checkout-session', {
        packageId,
        numberOfTravelers: formData.numberOfTravelers,
      });

      if (response.data.success && response.data.url) {
        window.location.href = response.data.url;
      } else {
        setError(response.data.message || 'Unable to start Stripe Checkout');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while starting checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h2>Complete Your Booking</h2>
      </div>

      <div className="payment-content">
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          {packageData ? (
            <>
              <div className="package-image">
                <img src={packageData.image} alt={packageData.name} />
              </div>
              <div className="summary-details">
                <h4>{packageData.name}</h4>
                <div className="summary-row">
                  <span>Destination:</span>
                  <span>{packageData.destination}</span>
                </div>
                <div className="summary-row">
                  <span>Duration:</span>
                  <span>{calculateDuration(packageData.startDate, packageData.endDate)} days</span>
                </div>
                <div className="summary-row">
                  <span>Dates:</span>
                  <span>{formatDate(packageData.startDate)} - {formatDate(packageData.endDate)}</span>
                </div>
                <div className="summary-row">
                  <span>Tour Type:</span>
                  <span>{packageData.tourType}</span>
                </div>
                <div className="traveler-selector">
                  <span>Number of Travelers:</span>
                  <div className="traveler-controls">
                    <button type="button" onClick={() => handleTravelerChange(-1)} disabled={formData.numberOfTravelers <= 1}>
                      -
                    </button>
                    <input
                      type="number"
                      name="numberOfTravelers"
                      value={formData.numberOfTravelers}
                      onChange={handleTravelerInput}
                      onBlur={handleTravelerBlur}
                      min="1"
                      style={{
                        width: '50px',
                        textAlign: 'center',
                        margin: '0 10px',
                        padding: '5px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <button type="button" onClick={() => handleTravelerChange(1)}>
                      +
                    </button>
                  </div>
                </div>
                <div className="price-calculation">
                  <div className="calc-row">
                    <span>Package Price:</span>
                    <span>${packageData.price?.toLocaleString()} x {formData.numberOfTravelers}</span>
                  </div>
                  <div className="total-price">
                    <span>Total:</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p>Loading package details...</p>
          )}
        </div>

        <div className="payment-form-section">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={processPayment} className="payment-form">
            <h3>Payment Information</h3>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 123-4567" required />
            </div>

            <div className="payment-summary-note">
              Card details are entered securely on Stripe Checkout.
            </div>

            <button type="submit" className={isLoading ? 'payment-btn loading' : 'payment-btn'} disabled={isLoading}>
              {isLoading ? 'Redirecting...' : 'Pay with Stripe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PackagePayment;
