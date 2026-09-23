import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../tourguide-signup/TourGuideSignUp.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../../../images/logo.png';

const sideImageUrl = "https://images.unsplash.com/photo-1530789253388-582c481c54b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80";

const TourGuideSignUp = () => {
  const [formData, setFormData] = useState({
    guideName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role:"TourGuide"
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/TourGuide/register', formData);

      // Store token and guide ID in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('guideId', response.data.guideId);
      
      // Set success message
      setSuccess('Registration successful! Redirecting to login page...');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="signup-container-r">
      <div className="signup-left-r">
        <div className="logo-container-r">
          <img src={logo} alt="Logo" className="logo-r" />
        </div>

        <h1 className="signup-title-r">Sign Up as Tour Guide</h1>
        <p className="signup-subtitle-r">Please fill in your details to create your account</p>

        {error && <div className="error-message-r">{error}</div>}
        {success && <div className="success-message-r">{success}</div>}

        <form className="signup-form-r" onSubmit={handleSubmit}>
          <div className="form-group-r">
            <label htmlFor="guideName" className="form-label-r">Full Name</label>
            <input
              type="text"
              id="guideName"
              name="guideName"
              className="form-input-r"
              placeholder="Enter your full name"
              value={formData.guideName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group-r">
            <label htmlFor="email" className="form-label-r">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input-r"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group-r">
            <label htmlFor="password" className="form-label-r">Password</label>
            <div className="password-input-container-r">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-input-r"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
              <span className="password-toggle-icon-r" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="form-group-r">
            <label htmlFor="confirmPassword" className="form-label-r">Confirm Password</label>
            <div className="password-input-container-r">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                className="form-input-r"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
              />
              <span className="password-toggle-icon-r" onClick={toggleConfirmPasswordVisibility}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="signup-button-r">Sign Up</button>

          <div className="divider-r"><span>or</span></div>

          <div className="login-link-r">
            Already registered? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>

      <div className="signup-right-r">
        <img src={sideImageUrl} alt="Tour Guide" className="right-image-r" />
      </div>
    </div>
  );
};

export default TourGuideSignUp;