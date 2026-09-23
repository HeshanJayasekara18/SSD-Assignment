import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCreditCard, 
  faEnvelope, 
  faUser, 
  faPhone, 
  faCheckCircle 
} from "@fortawesome/free-solid-svg-icons";
import "./BookingPaymentProcessor.css";

// Simple UUID generator 
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const BookingPaymentProcessor = ({ bookingData, onPaymentComplete, onCancel }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Initialize payment data with default values
  const [paymentData, setPaymentData] = useState({
    payID: generateId(),
    cuspayId: bookingData?.cuspayId || `PAY-${Date.now()}`,
    fullName: "",
    email: "",
    phonenum: "",
    touristID: localStorage.getItem("touristID") || "",
    UserID: localStorage.getItem("userID") || "",
    totalAmount: bookingData?.totalAmount || 0,
    payment_amount: bookingData?.payment_amount || 0,
    cardDetails: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const [errors, setErrors] = useState({});

  // Effect to load data when component mounts or bookingData changes
  useEffect(() => {
    // Get IDs from localStorage
    const touristID = localStorage.getItem("touristID");
    const userID = localStorage.getItem("userID");
    
    if (bookingData) {
      setPaymentData((prev) => ({
        ...prev,
        phonenum: bookingData.mobile_number || "",
        touristID: touristID || bookingData.touristID || "",
        UserID: userID || prev.UserID, // ensure UserID is set
        payment_amount: bookingData.payment_amount || 0,
        totalAmount: bookingData.totalAmount || bookingData.payment_amount || 0,
        cuspayId: bookingData.cuspayId || `PAY-${Date.now()}`
      }));
    } else {
      // If no bookingData is provided, at least set the IDs
      setPaymentData((prev) => ({
        ...prev,
        touristID: touristID || "",
        UserID: userID || ""
      }));
    }
  }, [bookingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setPaymentData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setPaymentData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (activeStep === 0) {
      if (!paymentData.fullName) newErrors.fullName = "Full name is required";
      if (!paymentData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(paymentData.email)) newErrors.email = "Invalid email";
      if (!paymentData.phonenum) newErrors.phonenum = "Phone number is required";
      else if (!/^\d{10}$/.test(paymentData.phonenum)) newErrors.phonenum = "Phone number must be 10 digits";
    }

    if (activeStep === 1) {
      if (!paymentData.cardDetails.cardNumber)
        newErrors["cardDetails.cardNumber"] = "Card number is required";
      else if (!/^\d{16}$/.test(paymentData.cardDetails.cardNumber))
        newErrors["cardDetails.cardNumber"] = "Card number must be 16 digits";

      if (!paymentData.cardDetails.expiryDate)
        newErrors["cardDetails.expiryDate"] = "Expiry date is required";
      else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.cardDetails.expiryDate))
        newErrors["cardDetails.expiryDate"] = "Expiry date must be MM/YY";

      if (!paymentData.cardDetails.cvv)
        newErrors["cardDetails.cvv"] = "CVV is required";
      else if (!/^\d{3,4}$/.test(paymentData.cardDetails.cvv))
        newErrors["cardDetails.cvv"] = "CVV must be 3 or 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError("");

    try {
      // Ensure we have required IDs
      if (!paymentData.touristID) {
        throw new Error("Tourist ID is missing. Please log in again.");
      }
      
      if (!paymentData.UserID) {
        throw new Error("User ID is missing. Please log in again.");
      }

      // Prepare payment payload with all required fields
      const paymentPayload = {
        cuspayId: paymentData.cuspayId,
        payID: paymentData.payID,
        fullName: paymentData.fullName,
        email: paymentData.email,
        phonenum: paymentData.phonenum,
        touristID: paymentData.touristID,
        UserID: paymentData.UserID,
        totalAmount: paymentData.totalAmount,
        cardDetails: paymentData.cardDetails
      };

      // Submit payment
      const response = await axios.post(
        "http://localhost:4000/api/customizePayment",
        paymentPayload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setSuccess(true);
      setTimeout(() => {
        if (onPaymentComplete) onPaymentComplete(response.data);
      }, 2000);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || err.message || "Payment processing failed.");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Customer Info", "Card Details", "Confirmation"];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="form-container">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input
                  type="text"
                  name="fullName"
                  value={paymentData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>
              {errors.fullName && <div className="error-message">{errors.fullName}</div>}
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={paymentData.email}
                  onChange={handleChange}
                  placeholder="Your email address"
                />
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faPhone} className="input-icon" />
                <input
                  type="text"
                  name="phonenum"
                  value={paymentData.phonenum}
                  onChange={handleChange}
                  placeholder="Your 10-digit phone number"
                />
              </div>
              {errors.phonenum && <div className="error-message">{errors.phonenum}</div>}
            </div>
            
            <div className="id-information">
              <div className="id-item">
                <label>Tourist ID:</label>
                <span>{paymentData.touristID || "Not available"}</span>
              </div>
              <div className="id-item">
                <label>User ID:</label>
                <span>{paymentData.UserID || "Not available"}</span>
              </div>
              {(!paymentData.touristID || !paymentData.UserID) && (
                <div className="warning-message">
                  User ID or Tourist ID not found. Please make sure you are logged in.
                </div>
              )}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="form-container">
            <div className="form-group">
              <label>Card Number</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faCreditCard} className="input-icon" />
                <input
                  type="text"
                  name="cardDetails.cardNumber"
                  value={paymentData.cardDetails.cardNumber}
                  onChange={handleChange}
                  placeholder="16-digit card number"
                  maxLength="16"
                />
              </div>
              {errors["cardDetails.cardNumber"] && (
                <div className="error-message">{errors["cardDetails.cardNumber"]}</div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="cardDetails.expiryDate"
                  value={paymentData.cardDetails.expiryDate}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  maxLength="5"
                />
                {errors["cardDetails.expiryDate"] && (
                  <div className="error-message">{errors["cardDetails.expiryDate"]}</div>
                )}
              </div>
              
              <div className="form-group half">
                <label>CVV</label>
                <input
                  type="password"
                  name="cardDetails.cvv"
                  value={paymentData.cardDetails.cvv}
                  onChange={handleChange}
                  placeholder="CVV"
                  maxLength="4"
                />
                {errors["cardDetails.cvv"] && (
                  <div className="error-message">{errors["cardDetails.cvv"]}</div>
                )}
              </div>
            </div>
            
            <div className="payment-summary">
              <h3>Payment Summary</h3>
              <div className="summary-row">
                <span>Amount:</span>
                <span className="amount">Rs {paymentData.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="confirmation-container">
            {success ? (
              <div className="success-message">
                <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
                <h2>Payment Successful</h2>
                <p>Your payment ID: {paymentData.payID}</p>
                <p className="redirect-message">You will be redirected shortly...</p>
              </div>
            ) : (
              <>
                <h2>Confirm Your Payment</h2>
                <div className="confirm-details">
                  <div className="confirm-row">
                    <span>Name:</span>
                    <span>{paymentData.fullName}</span>
                  </div>
                  <div className="confirm-row">
                    <span>Email:</span>
                    <span>{paymentData.email}</span>
                  </div>
                  <div className="confirm-row">
                    <span>Phone:</span>
                    <span>{paymentData.phonenum}</span>
                  </div>
                  <div className="confirm-row">
                    <span>Card:</span>
                    <span>**** **** **** {paymentData.cardDetails.cardNumber.slice(-4)}</span>
                  </div>
                  <div className="confirm-row total">
                    <span>Amount:</span>
                    <span>Rs {paymentData.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                {error && <div className="error-alert">{error}</div>}
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="payment-processor-card">
      <h2>Payment Process</h2>
      
      <div className="payment-stepper">
        {steps.map((label, index) => (
          <div 
            key={index}
            className={`stepper-step ${index === activeStep ? 'active' : ''} ${
              index < activeStep ? 'completed' : ''
            }`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="step-content">
        {renderStepContent(activeStep)}
      </div>

      <div className="button-container">
        <button 
          className="secondary-button"
          onClick={activeStep === 0 ? onCancel : handleBack}
        >
          {activeStep === 0 ? "Cancel" : "Back"}
        </button>

        {activeStep === steps.length - 1 ? (
          <button 
            className={`primary-button ${loading ? 'loading' : ''}`}
            onClick={handleSubmit} 
            disabled={loading || success || !paymentData.touristID || !paymentData.UserID}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </button>
        ) : (
          <button 
            className="primary-button"
            onClick={handleNext}
            disabled={activeStep === 0 && (!paymentData.touristID || !paymentData.UserID)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingPaymentProcessor;