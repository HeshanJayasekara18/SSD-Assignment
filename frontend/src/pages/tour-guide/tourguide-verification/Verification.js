import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../tourguide-verification/Verification.css';

const Verification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('Please enter the verification code sent to your email');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const email = localStorage.getItem('email');
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:4000/api/TourGuide/verify',
        { email, verificationCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setVerificationCode('');
        setMessage('Verification successful! Redirecting to dashboard...');
        setError('');
        setTimeout(() => navigate('/TourGuide'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleResendCode = async () => {
    try {
      const email = localStorage.getItem('email');
      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:4000/api/TourGuide/resend-verification',
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('A new verification code has been sent to your email');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification code');
    }
  };

  return (
    <div className="verification-containerr">
      <div className="verification-formr">
        <h2>Verify Your Account</h2>
        {message && <div className="messager">{message}</div>}
        {error && <div className="error-messager">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-groupr">
            <label>Verification Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="verify-buttonr">Verify Account</button>
        </form>
        <button onClick={handleResendCode} className="resend-buttonr">
          Resend Verification Code
        </button>
      </div>
    </div>
  );
};

export default Verification;
