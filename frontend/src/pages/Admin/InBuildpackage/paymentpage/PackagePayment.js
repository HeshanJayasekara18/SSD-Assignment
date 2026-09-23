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

  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentId, setPaymentId] = useState('');

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

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData({
      ...cardData,
      [name]: value,
    });
    if (error) setError(null);
  };

  const handleTravelerChange = (change) => {
    const newCount = Math.max(1, formData.numberOfTravelers + change);
    setFormData({
      ...formData,
      numberOfTravelers: newCount,
    });
  };

  // New function to handle direct input of number of travelers
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

  // Handle blur event to ensure we don't have empty values
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
    if (!cardData.cardNumber.trim() || cardData.cardNumber.replace(/\s/g, '').length < 13) {
      setError('Valid card number is required');
      return false;
    }
    if (!cardData.expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
      setError('Valid expiry date (MM/YY) is required');
      return false;
    }
    if (!cardData.cvv.trim() || !/^\d{3,4}$/.test(cardData.cvv)) {
      setError('Valid CVV code is required');
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

      const paymentData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        packageId,
        numberOfTravelers: formData.numberOfTravelers,
        totalAmount: totalPrice,
        cardDetails: {
          cardNumber: cardData.cardNumber.replace(/\s/g, ''),
          expiryDate: cardData.expiryDate,
          cvv: cardData.cvv,
        },
      };

      const response = await axios.post('http://localhost:4000/api/payment/process', paymentData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;
      

      if (data.success) {
        setPaymentId(data.payment.paymentId);
        setPaymentComplete(true);
        sendMail(data.payment.paymentId);
      } else {
        setError(data.message || 'Payment processing failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'An error occurred while processing payment');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMail = async(payId) => {
    try {
      const response = await axios.post("http://localhost:4000/api/sendMail",{
        email: formData.email,
        paymentId: payId,
        amount: totalPrice,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        console.log("Email sent successfully");
      }
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please try again.");
    }
  }

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
                <img
                  src={packageData.image}
                  alt={packageData.name}
                />
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
                
                {/* Added traveler selection with input field */}
                <div className="traveler-selector">
                  <span>Number of Travelers:</span>
                  <div className="traveler-controls">
                    <button 
                      type="button" 
                      onClick={() => handleTravelerChange(-1)}
                      disabled={formData.numberOfTravelers <= 1}
                    >
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
                    <button 
                      type="button" 
                      onClick={() => handleTravelerChange(1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="price-calculation">
                  <div className="calc-row">
                    <span>Package Price:</span>
                    <span>
                      ${packageData.price?.toLocaleString()} × {formData.numberOfTravelers}
                    </span>
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

          {!paymentComplete ? (
            <form onSubmit={processPayment} className="payment-form">
              <h3>Payment Information</h3>

              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={cardData.cardNumber}
                  onChange={handleCardChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
              </div>

              <div className="card-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={cardData.expiryDate}
                    onChange={handleCardChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    type="password"
                    id="cvv"
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleCardChange}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className={isLoading ? 'payment-btn loading' : 'payment-btn'}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Complete Payment'}
              </button>
            </form>
          ) : (
            <div className="payment-success">
              <div className="success-icon">✓</div>
              <h3>Payment Successful!</h3>
              <p>
                Your booking has been confirmed. A confirmation email has been sent to{' '}
                {formData.email}
              </p>
              <div className="booking-details">
                <div className="detail-row">
                  <span>Payment ID:</span>
                  <span>{paymentId}</span>
                </div>
                <div className="detail-row">
                  <span>Amount Paid:</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackagePayment;