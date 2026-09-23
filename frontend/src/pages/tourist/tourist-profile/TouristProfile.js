import React, { useState, useEffect } from 'react';
import './TouristProfile.css';
import axios from 'axios';

const TouristProfile = () => {
  // State for user profile data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    timeZone: '+5 GMT',
    phone: '',
    email: '',
    country: 'United States'
  });

  // State for tracking which fields are being edited
  const [editableFields, setEditableFields] = useState({
    firstName: false,
    lastName: false,
    timeZone: false,
    phone: false,
    email: false,
    country: false
  });

  // State for password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordStep, setPasswordStep] = useState(1); // 1 = current password, 2 = new password
  
  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Get tourist data from local storage
  useEffect(() => {
    const fetchTouristData = async () => {
      try {
        const touristID = localStorage.getItem('touristID');
        const userID = localStorage.getItem('userID');
        
        if (!touristID || !userID) {
          setError('Authentication information missing. Please login again.');
          setLoading(false);
          return;
        }
        
        // Fixed: Corrected the axios get request syntax
        const response = await axios.get(`/api/tourist/${touristID}`, {
          headers: {
            'user-id': userID
          }
        });
      
        const touristData = response.data;
        
        // Added check if response data exists
        if (!touristData) {
          setError('No profile data found.');
          setLoading(false);
          return;
        }
        
        // Split fullname into firstName and lastName
        let firstName = '';
        let lastName = '';
        
        if (touristData.fullname) {
          const nameParts = touristData.fullname.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }
        
        setFormData({
          firstName,
          lastName,
          timeZone: touristData.timeZone || '+5 GMT',
          phone: touristData.mobile_number ? touristData.mobile_number.toString() : '',
          email: touristData.email || '',
          country: touristData.country || 'United States'
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        // Enhanced error message with more details
        setError(`Failed to load profile data: ${err.response?.data?.message || err.message}. Please try again later.`);
        setLoading(false);
      }
    };
    
    fetchTouristData();
  }, []);

  // Handle editing toggle for individual fields
  const toggleEdit = (field) => {
    setEditableFields({
      ...editableFields,
      [field]: !editableFields[field]
    });
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    // Clear any error messages when user starts typing
    setPasswordError('');
  };

  // Verify current password and move to next step
  const verifyCurrentPassword = async () => {
    try {
      const userID = localStorage.getItem('userID');
      
      if (!userID) {
        setPasswordError('User ID not found. Please login again.');
        return;
      }
      
      const response = await axios.post('/api/user/verify-password', {
        userID,
        password: passwordData.currentPassword
      });
      
      if (response.data.verified) {
        setPasswordStep(2);
        setPasswordError('');
      } else {
        setPasswordError('Current password is incorrect');
      }
    } catch (err) {
      console.error('Error verifying password:', err);
      setPasswordError(`Failed to verify password: ${err.response?.data?.message || err.message}. Please try again.`);
    }
  };

  // Change password
  const changePassword = async () => {
    // Validate passwords match
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const userID = localStorage.getItem('userID');
      
      if (!userID) {
        setPasswordError('User ID not found. Please login again.');
        return;
      }
      
      await axios.put('/api/user/change-password', {
        userID,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordSuccess('Password changed successfully!');
      
      // Reset form after short delay
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordStep(1);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(`Failed to change password: ${err.response?.data?.message || err.message}. Please try again later.`);
    }
  };

  // Handle save changes for individual fields
  const saveField = async (field) => {
    try {
      const touristID = localStorage.getItem('touristID');
      const userID = localStorage.getItem('userID');
      
      if (!touristID || !userID) {
        setError('Authentication information missing. Please login again.');
        return;
      }
      
      // Prepare data for update based on field type
      let updateData = {};
      
      if (field === 'firstName' || field === 'lastName') {
        // Combine first and last name for fullname
        updateData.fullname = `${formData.firstName} ${formData.lastName}`;
      } else if (field === 'phone') {
        updateData.mobile_number = formData.phone;
      } else {
        updateData[field] = formData[field];
      }
      
      // Send update to backend
      await axios.put(`/api/tourists/${touristID}`, updateData, {
        headers: {
          'user-id': userID
        }
      });
      
      // Also update email in User model if email is being changed
      if (field === 'email') {
        await axios.put(`/api/user/${userID}`, {
          email: formData.email
        });
      }
      
      toggleEdit(field);
      setUpdateSuccess(`${field} updated successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess('');
      }, 3000);
    } catch (err) {
      console.error(`Error saving ${field}:`, err);
      setError(`Failed to update ${field}: ${err.response?.data?.message || err.message}. Please try again.`);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('touristID');
    localStorage.removeItem('userID');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  // Countries list
  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 
    'Germany', 'France', 'Japan', 'India', 'Brazil', 'South Africa'
  ];

  // Time zone options
  const timeZones = [
    '+5 GMT', 'UTC', 'GMT', 'EST', 'CST', 'MST', 'PST', 
    'AEST', 'JST', 'IST', 'CET', 'EET'
  ];

  if (loading) {
    return <div className="tprofile-loading">Loading profile data...</div>;
  }

  return (
    <div className="tprofile-container">
      <div className="tprofile-header">
        <h1>My Profile</h1>
        <div className="tprofile-action-buttons">
          <button className="tprofile-logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>

      {error && <div className="tprofile-error-banner">{error}</div>}
      {updateSuccess && <div className="tprofile-success-banner">{updateSuccess}</div>}

      <div className="tprofile-content">
        <div className="tprofile-sidebar">
          <div className="tprofile-avatar">
            <div className="tprofile-avatar-placeholder">
              {formData.firstName && formData.firstName[0]}
              {formData.lastName && formData.lastName[0]}
            </div>
          </div>
          <button className="tprofile-password-change-btn" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </button>
        </div>

        <div className="tprofile-main">
          <div className="tprofile-section tprofile-personal-info">
            <h2>Personal Information</h2>
            <div className="tprofile-field-grid">
              {/* First Name Field */}
              <div className="tprofile-form-field">
                <label>FIRST NAME</label>
                <div className="tprofile-field-container">
                  {editableFields.firstName ? (
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  ) : (
                    <span className="tprofile-field-value">{formData.firstName}</span>
                  )}
                  <button 
                    className="tprofile-edit-btn"
                    onClick={() => editableFields.firstName ? saveField('firstName') : toggleEdit('firstName')}
                  >
                    {editableFields.firstName ? 'Save' : 'Edit'}
                  </button>
                </div>
              </div>
              
              {/* Last Name Field */}
              <div className="tprofile-form-field">
                <label>LAST NAME</label>
                <div className="tprofile-field-container">
                  {editableFields.lastName ? (
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  ) : (
                    <span className="tprofile-field-value">{formData.lastName}</span>
                  )}
                  <button 
                    className="tprofile-edit-btn"
                    onClick={() => editableFields.lastName ? saveField('lastName') : toggleEdit('lastName')}
                  >
                    {editableFields.lastName ? 'Save' : 'Edit'}
                  </button>
                </div>
              </div>
              
              {/* Country Field */}
              <div className="tprofile-form-field">
                <label>COUNTRY</label>
                <div className="tprofile-field-container">
                  {editableFields.country ? (
                    <select 
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    >
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="tprofile-field-value">{formData.country}</span>
                  )}
                  <button 
                    className="tprofile-edit-btn"
                    onClick={() => editableFields.country ? saveField('country') : toggleEdit('country')}
                  >
                    {editableFields.country ? 'Save' : 'Edit'}
                  </button>
                </div>
              </div>
              
              {/* Time Zone Field */}
              <div className="tprofile-form-field">
                <label>TIME ZONE</label>
                <div className="tprofile-field-container">
                  {editableFields.timeZone ? (
                    <select 
                      name="timeZone"
                      value={formData.timeZone}
                      onChange={handleChange}
                    >
                      {timeZones.map(zone => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="tprofile-field-value">{formData.timeZone}</span>
                  )}
                  <button 
                    className="tprofile-edit-btn"
                    onClick={() => editableFields.timeZone ? saveField('timeZone') : toggleEdit('timeZone')}
                  >
                    {editableFields.timeZone ? 'Save' : 'Edit'}
                  </button>
                </div>
              </div>
              
              {/* Phone Field */}
              <div className="tprofile-form-field">
                <label>PHONE</label>
                <div className="tprofile-field-container">
                  {editableFields.phone ? (
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  ) : (
                    <span className="tprofile-field-value">{formData.phone}</span>
                  )}
                  <button 
                    className="tprofile-edit-btn"
                    onClick={() => editableFields.phone ? saveField('phone') : toggleEdit('phone')}
                  >
                    {editableFields.phone ? 'Save' : 'Edit'}
                  </button>
                </div>
              </div>
              
              {/* Email Field */}
              <div className="tprofile-form-field">
                <label>EMAIL ADDRESS</label>
                <div className="tprofile-field-container">
                  {editableFields.email ? (
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  ) : (
                    <span className="tprofile-field-value">{formData.email}</span>
                  )}
                  <button 
                    className="tprofile-edit-btn"
                    onClick={() => editableFields.email ? saveField('email') : toggleEdit('email')}
                  >
                    {editableFields.email ? 'Save' : 'Edit'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Thank You Section with Background Image */}
          <div className="tprofile-section tprofile-thank-you-section">
            <div className="tprofile-thank-you-content">
              <h2>Thank You For Being With Us!</h2>
              <p>We appreciate your continued support and trust in our services.</p>
              <p>If you need any assistance, please don't hesitate to contact our support team.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="tprofile-modal-overlay">
          <div className="tprofile-modal-content">
            <div className="tprofile-modal-header">
              <h3>Change Password</h3>
              <button className="tprofile-close-btn" onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
                setPasswordStep(1);
                setPasswordError('');
                setPasswordSuccess('');
              }}>×</button>
            </div>
            <div className="tprofile-modal-body">
              {passwordSuccess ? (
                <div className="tprofile-success-message">{passwordSuccess}</div>
              ) : (
                <>
                  {passwordStep === 1 ? (
                    <div className="tprofile-password-step">
                      <div className="tprofile-form-field">
                        <label>CURRENT PASSWORD</label>
                        <input 
                          type="password" 
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="tprofile-password-input"
                          placeholder="Enter your current password"
                        />
                      </div>
                      {passwordError && <div className="tprofile-error-message">{passwordError}</div>}
                      <div className="tprofile-modal-actions">
                        <button 
                          className="tprofile-primary-btn" 
                          onClick={verifyCurrentPassword}
                          disabled={!passwordData.currentPassword}
                        >
                          Continue
                        </button>
                        <button 
                          className="tprofile-secondary-btn" 
                          onClick={() => setShowPasswordModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="tprofile-password-step">
                      <div className="tprofile-form-field">
                        <label>NEW PASSWORD</label>
                        <input 
                          type="password" 
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="tprofile-password-input"
                          placeholder="Enter new password"
                        />
                        <small className="tprofile-password-hint">Password must be at least 8 characters</small>
                      </div>
                      <div className="tprofile-form-field">
                        <label>CONFIRM NEW PASSWORD</label>
                        <input 
                          type="password" 
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="tprofile-password-input"
                          placeholder="Confirm new password"
                        />
                      </div>
                      {passwordError && <div className="tprofile-error-message">{passwordError}</div>}
                      <div className="tprofile-modal-actions">
                        <button 
                          className="tprofile-primary-btn" 
                          onClick={changePassword}
                          disabled={!passwordData.newPassword || !passwordData.confirmPassword}
                        >
                          Change Password
                        </button>
                        <button 
                          className="tprofile-secondary-btn" 
                          onClick={() => {
                            setPasswordStep(1);
                            setPasswordData({
                              ...passwordData,
                              newPassword: '',
                              confirmPassword: ''
                            });
                          }}
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouristProfile;