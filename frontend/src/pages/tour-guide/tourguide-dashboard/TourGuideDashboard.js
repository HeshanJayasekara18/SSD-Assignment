import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import  TourGuideSideBar from '../tourguide-sidebar/TourGuideSideBar';
import './TourGuideDashboard.css';

const TourGuideDashboard = () => {
  const navigate = useNavigate();

  const [guideStats, setGuideStats] = useState({
    totalGuides: 0,
    activeGuides: 0,
    pendingGuides: 0,
    activeTrips: 0,
  });
  
  const [profileData, setProfileData] = useState({
    guideName: '',
    email: '',
    gender: '',
    phoneNumber: '',
    age: '',
    profileImage: null,  // Changed from '' to null for file input
    experience: '',
    languages: '',
    specializationList: '',  // Added this to match your form and API
    locations: '',
    description: '',
    bio: '',
    amount: '',  // Added this to match your form and API
  });
  
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/GuideDetails', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setGuideStats(response.data.stats);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage" && files.length > 0) {
      setProfileData({ ...profileData, profileImage: files[0] });
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const guideId = localStorage.getItem('guideId'); 
    const formData = new FormData();
  
    for (let key in profileData) {
      formData.append(key, profileData[key]);
    }
    formData.append('guideId', guideId); 
  
    try {
      await axios.post('http://localhost:4000/api/GuideDetails/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSubmitSuccess(true);
      navigate('/TourGuide/profile');
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };  
  
  if (loading) {
    return <div className="loadingr">Loading dashboard...</div>;
  }
  
  return (
    <div className="dashboard-containerr">
      <TourGuideSideBar />
      <div className="dashboard-contentr">
        <h1>Tour Guide Dashboard</h1>
        
        <div className="stats-containerr">
          <div className="stat-cardr">
            <h3>Total Tour Guides</h3>
            <p>{guideStats.totalGuides}</p>
          </div>
          <div className="stat-cardr">
            <h3>Active Tour Guides</h3>
            <p>{guideStats.activeGuides}</p>
          </div>
          <div className="stat-cardr">
            <h3>Pending Approvals</h3>
            <p>{guideStats.pendingGuides}</p>
          </div>
          <div className="stat-cardr">
            <h3>Active Trips</h3>
            <p>{guideStats.activeTrips}</p>
          </div>
        </div>
        
        <div className="info-sectionr">
          <h2>About Tour Guide Management</h2>
          <p>
            Welcome to our Tour Guide Management System! As a tour guide, you play a crucial role
            in providing memorable experiences for tourists. Complete your profile below to join
            our network of professional guides.
          </p>
          <p>
            After submission, your information will be reviewed by our admin team. Once approved,
            you'll receive a verification code to complete your registration.
          </p>
        </div>
        
        <div className="profile-form-containerr">
          <h2>Complete Your Tour Guide Profile</h2>
          {error && <div className="error-messager">{error}</div>}
          {submitSuccess && <div className="success-messager">Profile submitted successfully! Admin will review your application.</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-rowr">
              <div className="form-groupr">
                <label>Gender</label>
                <select name="gender" value={profileData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-groupr">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-rowr">
              <div className="form-groupr">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={profileData.age}
                  onChange={handleChange}
                  min="18"
                  required
                />
              </div>
              <div className="form-groupr">
                <label>Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  value={profileData.experience}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>
            </div>
            
            <div className="form-rowr">
              <div className="form-groupr">
                <label>Languages Spoken</label>
                <input
                  type="text"
                  name="languages"
                  value={profileData.languages}
                  onChange={handleChange}
                  placeholder="e.g., English, Spanish, French"
                  required
                />
              </div>
              <div className="form-groupr">
                <label>Specialization Areas</label>
                <input
                  type="text"
                  name="specializationList"
                  value={profileData.specializationList}
                  onChange={handleChange}
                  placeholder="e.g., Historical tours, Adventure tours"
                  required
                />
              </div>
            </div>
            
            <div className="form-rowr">
              <div className="form-groupr">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  rows="3"
                  required
                ></textarea>
              </div>
              <div className="form-groupr">
                <label>Tour Locations</label>
                <input
                  type="text"
                  name="locations"
                  value={profileData.locations}
                  onChange={handleChange}
                  placeholder="e.g., Paris, London, Rome"
                  required
                />
              </div>
            </div>
            
            <div className="form-groupr">
              <label>Profile Image</label>
              <input
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleChange}
              />
            </div>

            <div className="form-groupr">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={profileData.amount}
                onChange={handleChange}
                placeholder="e.g. 2500.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="form-groupr">
              <label>Certifications & Qualifications</label>
              <textarea
                name="description"
                value={profileData.description}
                onChange={handleChange}
                placeholder="List your certifications and qualifications, separated by commas"
                rows="4"
                required
              ></textarea>
            </div>
            
            <button type="submit" className="submit-buttonr">Submit Application</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TourGuideDashboard;