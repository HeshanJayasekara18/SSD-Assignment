import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faUser,
  faPhone,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import "./BookingPaymentProcessor.css";

const BookingPaymentProcessor = ({ bookingData, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [paymentData, setPaymentData] = useState({
    fullName: "",
    email: "",
    phonenum: "",
    touristID: localStorage.getItem("touristID") || "",
    UserID: localStorage.getItem("userID") || "",
    totalAmount: bookingData?.totalAmount || bookingData?.payment_amount || 0,
    bookingId: bookingData?.bookingID || bookingData?.bookingId || "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const touristID = localStorage.getItem("touristID");
    const userID = localStorage.getItem("userID");

    if (bookingData) {
      setPaymentData((prev) => ({
        ...prev,
        phonenum: bookingData.mobile_number || "",
        touristID: touristID || bookingData.touristID || "",
        UserID: userID || prev.UserID,
        totalAmount: bookingData.totalAmount || bookingData.payment_amount || 0,
        bookingId: bookingData.bookingID || bookingData.bookingId || "",
      }));
    } else {
      setPaymentData((prev) => ({
        ...prev,
        touristID: touristID || "",
        UserID: userID || ""
      }));
    }
  }, [bookingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentData.fullName) newErrors.fullName = "Full name is required";
    if (!paymentData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(paymentData.email)) newErrors.email = "Invalid email";
    if (!paymentData.phonenum) newErrors.phonenum = "Phone number is required";
    else if (!/^\d{10}$/.test(paymentData.phonenum)) newErrors.phonenum = "Phone number must be 10 digits";
    if (!paymentData.bookingId) newErrors.bookingId = "Booking ID is missing";

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
      if (!paymentData.touristID || !paymentData.UserID) {
        throw new Error("User information is missing. Please log in again.");
      }

      // Security: the backend calculates the amount from bookingId; no card data is collected here.
      const response = await axios.post("http://localhost:4000/api/payment/create-checkout-session", {
        bookingId: paymentData.bookingId,
        numberOfTravelers: 1,
      });

      if (response.data.success && response.data.url) {
        window.location.href = response.data.url;
      } else {
        setError(response.data.message || "Unable to start Stripe Checkout.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment processing failed.");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Customer Info", "Confirmation"];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="form-container">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input type="text" name="fullName" value={paymentData.fullName} onChange={handleChange} placeholder="Your full name" />
              </div>
              {errors.fullName && <div className="error-message">{errors.fullName}</div>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                <input type="email" name="email" value={paymentData.email} onChange={handleChange} placeholder="Your email address" />
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faPhone} className="input-icon" />
                <input type="text" name="phonenum" value={paymentData.phonenum} onChange={handleChange} placeholder="Your 10-digit phone number" />
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
              {errors.bookingId && <div className="warning-message">{errors.bookingId}</div>}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="confirmation-container">
            <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
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
                <span>Payment page:</span>
                <span>Stripe Checkout</span>
              </div>
              <div className="confirm-row total">
                <span>Amount:</span>
                <span>Rs {paymentData.totalAmount.toLocaleString()}</span>
              </div>
            </div>
            {error && <div className="error-alert">{error}</div>}
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
            key={label}
            className={`stepper-step ${index === activeStep ? 'active' : ''} ${index < activeStep ? 'completed' : ''}`}
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
        <button className="secondary-button" onClick={activeStep === 0 ? onCancel : handleBack}>
          {activeStep === 0 ? "Cancel" : "Back"}
        </button>

        {activeStep === steps.length - 1 ? (
          <button
            className={`primary-button ${loading ? 'loading' : ''}`}
            onClick={handleSubmit}
            disabled={loading || !paymentData.touristID || !paymentData.UserID}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Redirecting...
              </>
            ) : (
              "Pay with Stripe"
            )}
          </button>
        ) : (
          <button className="primary-button" onClick={handleNext} disabled={!paymentData.touristID || !paymentData.UserID}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingPaymentProcessor;
