import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf'; 
import './TourGuideProfile.css';

const TourGuideProfile = () => {
  const [profileData, setProfileData] = useState({
    gender: '',
    phoneNumber: '',
    age: '',
    experience: '',
    languages: [],
    specializationList: [],
    bio: '',
    locations: [],
    description: '',
    profileImage: null,
    amount: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [testImg, setTestImg] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const guideId = localStorage.getItem('guideId');

      const response = await axios.get(`http://localhost:4000/api/GuideDetails/profile/${guideId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profile = response.data.profile || {};
      const profileImage = profile.profileImage || null;
      setTestImg(response.data.profile.profileImage);

      setProfileData({
        gender: profile.gender || '',
        phoneNumber: profile.phoneNumber || '',
        age: profile.age || '',
        experience: profile.experience || '',
        languages: Array.isArray(profile.languages) ? profile.languages.map(lang => String(lang)) : [],
        specializationList: Array.isArray(profile.specializationList)
          ? profile.specializationList.map(spec => String(spec))
          : [],
        bio: profile.bio || '',
        locations: Array.isArray(profile.locations) ? profile.locations.map(loc => String(loc)) : [],
        description: profile.description || '',
        amount: profile.amount || '',
        profileImage: profile.profileImage
          ? `data:${profile.profileImage.contentType};base64,${profile.profileImage.data}`
          : null,
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const { gender, phoneNumber, age, experience, languages, specializationList, bio, locations, description, amount } = profileData;

    // Adding content to the PDF
    doc.setFontSize(16);
    doc.text('Tour Guide Profile', 20, 20);

    doc.setFontSize(12);
    doc.text(`Gender: ${gender}`, 20, 30);
    doc.text(`Phone Number: ${phoneNumber}`, 20, 40);
    doc.text(`Age: ${age}`, 20, 50);
    doc.text(`Experience: ${experience} years`, 20, 60);
    doc.text(`Languages: ${languages.join(', ')}`, 20, 70);
    doc.text(`Specialization Areas: ${specializationList.join(', ')}`, 20, 80);
    doc.text(`Bio: ${bio}`, 20, 90);
    doc.text(`Locations: ${locations.join(', ')}`, 20, 100);
    doc.text(`Certifications: ${description}`, 20, 110);
    doc.text(`Amount per Tour: Rs. ${amount}`, 20, 120);

    // Save PDF to file
    doc.save('tour_guide_profile.pdf');
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'profileImage' && files.length > 0) {
      setNewProfileImage(files[0]);
      setPreviewImage(URL.createObjectURL(files[0]));
    } else if (name === 'languages' || name === 'specializationList' || name === 'locations') {
      setProfileData({
        ...profileData,
        [name]: value.split(',').map(item => item.trim()).filter(Boolean),
      });
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (editMode) {
      fetchProfileData();
      setNewProfileImage(null);
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const guideId = localStorage.getItem('guideId');

    const formData = new FormData();
    formData.append('guideId', guideId);
    formData.append('gender', profileData.gender);
    formData.append('phoneNumber', profileData.phoneNumber);
    formData.append('age', profileData.age);
    formData.append('experience', profileData.experience);
    formData.append('languages', profileData.languages.join(','));
    formData.append('specializationList', profileData.specializationList.join(','));
    formData.append('bio', profileData.bio);
    formData.append('locations', profileData.locations.join(','));
    formData.append('description', profileData.description);
    formData.append('amount', profileData.amount);

    if (newProfileImage) {
      formData.append('profileImage', newProfileImage);
    }

    try {
      await axios.put(`http://localhost:4000/api/GuideDetails/profile/${guideId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUpdateSuccess(true);
      setEditMode(false);
      fetchProfileData();
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Tour Guide Profile</h1>
        <button
          className={`edit-toggle-button ${editMode ? 'save-mode' : 'edit-mode'}`}
          onClick={handleEditToggle}
        >
          {editMode ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      <button onClick={generatePDF} className="download-pdf-button">
          Download Profile as PDF
      </button>

      {error && <div className="profile-error">{error}</div>}
      {updateSuccess && <div className="profile-success">Profile updated successfully!</div>}

      <div className="profile-content">
        <div className="profile-image-section">
          {editMode ? (
            <div className="profile-image-edit">
              <div className="current-image">
                <img src={testImg} alt="Tour Guide" />
              </div>
              <input
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleChange}
                className="image-input"
              />
            </div>
          ) : (
            <div className="profile-image">
              <img src={testImg} alt="Tour Guide" />
            </div>
          )}
        </div>

        <div className="profile-details">
          {editMode ? (
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={profileData.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phoneNumber" value={profileData.phoneNumber} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" name="age" value={profileData.age} onChange={handleChange} min="18" required />
                </div>
                <div className="form-group">
                  <label>Years of Experience</label>
                  <input type="number" name="experience" value={profileData.experience} onChange={handleChange} min="0" required />
                </div>
              </div>

              <div className="form-group">
                <label>Languages Spoken</label>
                <input
                  type="text"
                  name="languages"
                  value={profileData.languages.join(', ')}
                  onChange={handleChange}
                  placeholder="e.g., English, Spanish, French"
                  required
                />
              </div>

              <div className="form-group">
                <label>Specialization Areas</label>
                <input
                  type="text"
                  name="specializationList"
                  value={profileData.specializationList.join(', ')}
                  onChange={handleChange}
                  placeholder="e.g., Historical tours, Adventure tours"
                  required
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" value={profileData.bio} onChange={handleChange} rows="3" required></textarea>
              </div>

              <div className="form-group">
                <label>Tour Locations</label>
                <input
                  type="text"
                  name="locations"
                  value={profileData.locations.join(', ')}
                  onChange={handleChange}
                  placeholder="e.g., Paris, London, Rome"
                  required
                />
              </div>

              <div className="form-group">
                <label>Certifications & Qualifications</label>
                <textarea
                  name="description"
                  value={profileData.description}
                  onChange={handleChange}
                  placeholder="List your certifications and qualifications"
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={profileData.amount}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  min="0"
                  required
                />
              </div>

              <button type="submit" className="update-button">Update Profile</button>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-row">
                <div className="info-group">
                  <h3>Gender</h3>
                  <p>{profileData.gender}</p>
                </div>
                <div className="info-group">
                  <h3>Phone Number</h3>
                  <p>{profileData.phoneNumber}</p>
                </div>
              </div>

              <div className="info-row">
                <div className="info-group">
                  <h3>Age</h3>
                  <p>{profileData.age}</p>
                </div>
                <div className="info-group">
                  <h3>Years of Experience</h3>
                  <p>{profileData.experience}</p>
                </div>
              </div>

              <div className="info-section">
                <h3>Languages Spoken</h3>
                <div className="tag-container">
                  {profileData.languages.map((language, index) => (
                    <span key={index} className="tag">{language}</span>
                  ))}
                </div>
              </div>

              <div className="info-section">
                <h3>Specialization Areas</h3>
                <div className="tag-container">
                  {profileData.specializationList.map((specialization, index) => (
                    <span key={index} className="tag">{specialization}</span>
                  ))}
                </div>
              </div>

              <div className="info-section">
                <h3>Bio</h3>
                <p className="bio-text">{profileData.bio}</p>
              </div>

              <div className="info-section">
                <h3>Tour Locations</h3>
                <div className="tag-container">
                  {profileData.locations.map((location, index) => (
                    <span key={index} className="tag">{location}</span>
                  ))}
                </div>
              </div>

              <div className="info-section">
                <h3>Certifications & Qualifications</h3>
                <p className="description-text">{profileData.description}</p>
              </div>

              <div className="info-section">
                <h3>Amount</h3>
                <p className="amount-text">Rs.{profileData.amount}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourGuideProfile;
