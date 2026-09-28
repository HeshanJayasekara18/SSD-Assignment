import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CompleteProfile.css';
import { CountryCodes } from '../tourist-signup/CountryCodes';
import Logo from '../../../images/h-Logo.png';
import BodySideimg from '../../../images/body-sideimg.jpg';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const touristID = localStorage.getItem('touristID');
  const userID = localStorage.getItem('userID');

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!touristID && !userID) {
      navigate('/login');
    }
  }, [touristID, userID, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build mobile number as integer if provided
      let mobile_number = null;
      if (phoneNumber.trim()) {
        const fullNumberStr = (countryCode.replace(/\D/g, '') + phoneNumber.replace(/\D/g, '')).slice(0, 15);
        mobile_number = parseInt(fullNumberStr, 10) || null;
      }

      const updateData = {
        country: country.trim() || 'Not Specified',
      };
      if (mobile_number) {
        updateData.mobile_number = mobile_number;
      }

      await axios.put(`http://localhost:4000/api/Tourist/${touristID}`, updateData);

      navigate('/Tourist');
    } catch (err) {
      console.error('Error completing profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // User decided to skip: leave details as 'Not Specified' and continue
    navigate('/Tourist');
  };

  return (
    <div className="complete-profile-container">
      <div className="complete-profile-left">
        <div className="complete-profile-card">
          <div className="complete-profile-logo-container">
            <img src={Logo} alt="CeylonGO Logo" className="complete-profile-logo" />
          </div>

          <h2 className="complete-profile-title">Complete Your Profile</h2>
          <p className="complete-profile-subtitle">
            Please tell us where you're from and how we can reach you to enhance your travel experience.
          </p>

          {error && <div className="complete-profile-error">{error}</div>}

          <form className="complete-profile-form" onSubmit={handleSubmit}>
            <div className="complete-profile-group">
              <label className="complete-profile-label">Country</label>
              <select
                className="complete-profile-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Select your country</option>
                {CountryCodes.map((c, index) => (
                  <option key={`${c.code}-${index}`} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="complete-profile-group">
              <label className="complete-profile-label">Mobile Number</label>
              <div className="complete-profile-phone-container">
                <select
                  className="complete-profile-country-code"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {CountryCodes.map((c, index) => (
                    <option key={`${c.dial_code}-${index}`} value={c.dial_code}>
                      {c.code} ({c.dial_code})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  className="complete-profile-input"
                  placeholder="e.g. 712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="complete-profile-actions">
              <button
                type="submit"
                className="complete-profile-submit-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save & Continue'}
              </button>
              <button
                type="button"
                className="complete-profile-skip-btn"
                onClick={handleSkip}
                disabled={loading}
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="complete-profile-right">
        <img src={BodySideimg} alt="Sri Lanka Scenic Travel" className="complete-profile-bg-img" />
      </div>
    </div>
  );
};

export default CompleteProfile;
