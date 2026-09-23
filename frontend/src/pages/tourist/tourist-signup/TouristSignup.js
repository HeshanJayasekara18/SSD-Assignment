import React, { useState, useEffect } from 'react';
import axios from 'axios'; // ADD THIS
import './TouristSignup.css';
import { CountryCodes } from './CountryCodes';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import Logo from  "../../../images/h-Logo.png";
import BodySideimg from "../../../images/body-sideimg.jpg";

const TouristSignup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    countryCode: '+1',
    country: '',
    email: '',
    password: '',
    reEnterPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleBlur = (field) => {
    setTouched({
      ...touched,
      [field]: true
    });
  };

  useEffect(() => {
    validateForm();
  }, [formData, touched]);

  const validateForm = () => {
    const newErrors = {};
    if (touched.fullName && !formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (touched.phoneNumber && formData.phoneNumber && !/^\d{6,15}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Valid phone number required';
    if (touched.country && !formData.country) newErrors.country = 'Country is required';
    if (touched.email) {
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email required';
    }
    if (touched.password && (!formData.password || formData.password.length < 8)) newErrors.password = 'Min 8 characters';
    if (touched.reEnterPassword && formData.password !== formData.reEnterPassword) newErrors.reEnterPassword = 'Passwords do not match';
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = {};
    Object.keys(formData).forEach(key => allTouched[key] = true);
    setTouched(allTouched);
    validateForm();
  
    const hasErrors = Object.keys(errors).length > 0;
    if (!hasErrors) {
      try {
        const fullPhone = formData.countryCode + formData.phoneNumber;
  
        const response = await axios.post('http://localhost:4000/api/TouristRegister', {
          username: formData.email,
          fullname: formData.fullName,      
          email: formData.email,
          country: formData.country,
          mobile_number: fullPhone || '',
          password: formData.password, 
        });
  
        if (response.status === 201) {
          alert('Registration Successful!');
          setFormData({
            fullName: '',
            phoneNumber: '',
            countryCode: '+1',
            country: '',
            email: '',
            password: '',
            reEnterPassword: ''
          });
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Registration failed!');
      }
    }
  };
  

 
  return (
    <div className="signup-container-h">
      <div className="signup-left-h">
        <div className="logo-container-h">
          <img src={Logo} alt="CeylonGO Logo" className="logo-h" />
        </div>
        
        <h1 className="signup-title-h">Sign Up as Tourist</h1>
        <p className="signup-subtitle-h">Please fill in your details to create your account</p>
        
        <form className="signup-form-h" onSubmit={handleSubmit}>
          <div className="form-group-h">
            <label htmlFor="fullName" className="form-label-h">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className={`form-input-h ${errors.fullName ? 'input-error-h' : ''}`}
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={() => handleBlur('fullName')}
              required
            />
            {errors.fullName && <span className="error-message-h">{errors.fullName}</span>}
          </div>
          
          <div className="form-group-h phone-group-h">
            <label htmlFor="phoneNumber" className="form-label-h">Phone Number (Optional)</label>
            <div className="phone-input-container-h">
              <select
                className="country-code-select-h"
                name="countryCode"
                value={formData.CountryCode}
                onChange={handleChange}
              >
                {CountryCodes.map(country => (
                  <option key={country.code} value={country.dial_code}>
                    <span className="country-flag-h">{country.flag}</span> {country.dial_code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className={`form-input-h phone-input-h ${errors.phoneNumber ? 'input-error-h' : ''}`}
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={() => handleBlur('phoneNumber')}
              />
            </div>
            {errors.phoneNumber && <span className="error-message-h">{errors.phoneNumber}</span>}
          </div>
          
          <div className="form-group-h">
            <label htmlFor="country" className="form-label-h">Country</label>
            <select
              id="country"
              name="country"
              className={`form-input-h ${errors.country ? 'input-error-h' : ''}`}
              value={formData.country}
              onChange={handleChange}
              onBlur={() => handleBlur('country')}
              required
            >
              <option value="" disabled>Select your country</option>
              {CountryCodes.map(country => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country && <span className="error-message-h">{errors.country}</span>}
          </div>
          
          <div className="form-group-h">
            <label htmlFor="email" className="form-label-h">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input-h ${errors.email ? 'input-error-h' : ''}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              required
            />
            {errors.email && <span className="error-message-h">{errors.email}</span>}
          </div>
          
          <div className="form-group-h">
            <label htmlFor="password" className="form-label-h">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input-h ${errors.password ? 'input-error-h' : ''}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              required
            />
            {errors.password && <span className="error-message-h">{errors.password}</span>}
          </div>
          
          <div className="form-group-h">
            <label htmlFor="reEnterPassword" className="form-label-h">Re-enter Password</label>
            <input
              type="password"
              id="reEnterPassword"
              name="reEnterPassword"
              className={`form-input-h ${errors.reEnterPassword ? 'input-error-h' : ''}`}
              placeholder="Re-enter your password"
              value={formData.reEnterPassword}
              onChange={handleChange}
              onBlur={() => handleBlur('reEnterPassword')}
              required
            />
            {errors.reEnterPassword && <span className="error-message-h">{errors.reEnterPassword}</span>}
          </div>
          
          <button type="submit" className="signup-button-h">Sign Up</button>
          
          <div className="divider-h">
            <span>or</span>
          </div>
          
          {/* <div className="social-buttons-h">
            <button 
              type="button" 
              className="social-button-h google-h"
              onClick={() => handleSocialSignup('Google')}
            >
              <FaGoogle className="social-icon-h" />
              Sign up with Google
            </button>
            <button 
              type="button" 
              className="social-button-h facebook-h"
              onClick={() => handleSocialSignup('Facebook')}
            >
              <FaFacebook className="social-icon-h" />
              Sign up with Facebook
            </button>
          </div> */}
          
          <div className="login-link-h">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
      
      <div className="signup-right-h">
        <img src={BodySideimg} alt="Sigiriya" className="right-image-h" />
      </div>
    </div>
  );
};

export default TouristSignup;
