import React, { useState, useEffect } from 'react';
import './Addpackage.css';
import axios from 'axios';

function Homepage() {

  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});

  const tourTypes = [
    'Adventure', 'Beach', 'Cultural', 'Family', 'Luxury', 
    'Wildlife', 'Cruise', 'Hiking', 'Historical', 'Honeymoon'
  ];

  const [formData, setFormData] = useState({
    packageId: '',
    name: '',
    destination: '',
    price: '',
    description: '',
    startDate: '',
    endDate: '',
    tourGuideName: '',
    tourType: '',
    image: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate image size and format
      const validFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validFormats.includes(file.type)) {
        setErrors({
          ...errors,
          image: 'Invalid file format. Please upload JPEG, PNG, JPG or GIF images only.'
        });
        return;
      }
      
      if (file.size > maxSize) {
        setErrors({
          ...errors,
          image: 'Image size exceeds 5MB. Please upload a smaller image.'
        });
        return;
      }
      
      // Clear image error if any
      if (errors.image) {
        setErrors({
          ...errors,
          image: ''
        });
      }
      
      setFormData({
        ...formData,
        image: file
      });
      
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Package ID validation
    if (!formData.packageId.trim()) {
      newErrors.packageId = 'Package ID is required';
    } else if (!/^[A-Za-z0-9-]+$/.test(formData.packageId)) {
      newErrors.packageId = 'Package ID should contain only letters, numbers and hyphens';
    }
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Package name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Package name must be at least 3 characters';
    }
    
    // Destination validation
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    
    // Price validation
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description should be at least 20 characters';
    }
    
    // Date validations - only checking if they are provided
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    // Tour guide validation
    if (!formData.tourGuideName.trim()) {
      newErrors.tourGuideName = 'Tour guide name is required';
    }
    
    // Tour type validation
    if (!formData.tourType) {
      newErrors.tourType = 'Please select a tour type';
    }
    
    // Image validation
    if (!formData.image && !previewImage) {
      newErrors.image = 'Please upload a package image';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form before submission
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement.focus();
        }
      }
      return;
    }
    
    setIsSubmitting(true);
  
    // Create FormData for sending files
    const formDataToSend = new FormData();
    formDataToSend.append('packageId', formData.packageId);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('destination', formData.destination);
    formDataToSend.append('price', Number(formData.price));
    formDataToSend.append('description', formData.description);
    formDataToSend.append('startDate', new Date(formData.startDate).toISOString());
    formDataToSend.append('endDate', new Date(formData.endDate).toISOString());
    formDataToSend.append('tourGuideName', formData.tourGuideName);
    formDataToSend.append('tourType', formData.tourType);
  
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }  
    
    try {
      const response = await axios.post('http://localhost:4000/api/tourPackage', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data', // Required for file uploads
        },
      });
  
      console.log('Response from server:', response.data);
  
      setSubmitMessage({
        type: 'success',
        message: 'Tour package added successfully!',
      });
  
      setPreviewImage(null);
      setShowPreview(false);
      alert("Package Added Success..");
      
      // Reset form after successful submission
      setFormData({
        packageId: '',
        name: '',
        destination: '',
        price: '',
        description: '',
        startDate: '',
        endDate: '',
        tourGuideName: '',
        tourType: '',
        image: null
      });
      
    } catch (error) {
      console.error('Error saving data:', error.response ? error.response.data : error.message);
      setSubmitMessage({
          type: 'error',
          message: 'Failed to add tour package. Please try again.',
      });
    }
  
    setIsSubmitting(false);
  };

  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };
  
  return (
    <div className="container-j">
      <div className="wrapper-j">
        <div className="card-j">
          <div className="header-j">
            <h1 className="header-title-j">Add Tour Package</h1>
            <p className="header-subtitle-j">Complete the form below to add a new tour package</p>
          </div>
          
          {submitMessage.message && (
            <div className={submitMessage.type === 'success' ? 'alert-success-j' : 'alert-error-j'}>
              {submitMessage.message}
            </div>
          )}
          
          <div className="flex-row-j">
            {/* Left Side - Form */}
            <div className="form-section-j">
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-grid-j">
                  {/* Package ID */}
                  <div>
                    <label className="form-label-j" htmlFor="packageId">
                      Package ID
                    </label>
                    <input
                      type="text"
                      id="packageId"
                      name="packageId"
                      value={formData.packageId}
                      onChange={handleChange}
                      className={`form-input-j ${errors.packageId ? 'input-error-j' : ''}`}
                      required
                    />
                    {errors.packageId && <div className="error-message-j">{errors.packageId}</div>}
                  </div>
                  
                  {/* Package Name */}
                  <div>
                    <label className="form-label-j" htmlFor="name">
                      Package Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`form-input-j ${errors.name ? 'input-error-j' : ''}`}
                      required
                    />
                    {errors.name && <div className="error-message-j">{errors.name}</div>}
                  </div>
                  
                  {/* Destination */}
                  <div>
                    <label className="form-label-j" htmlFor="destination">
                      Destination
                    </label>
                    <input
                      type="text"
                      id="destination"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      className={`form-input-j ${errors.destination ? 'input-error-j' : ''}`}
                      required
                    />
                    {errors.destination && <div className="error-message-j">{errors.destination}</div>}
                  </div>
                  
                  {/* Price */}
                  <div>
                    <label className="form-label-j" htmlFor="price">
                      Price
                    </label>
                    <div className="form-input-with-icon-j">
                      <span className="form-input-icon-j">$</span>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className={`form-input-j form-input-with-padding-j ${errors.price ? 'input-error-j' : ''}`}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {errors.price && <div className="error-message-j">{errors.price}</div>}
                  </div>
                  
                  {/* Start Date */}
                  <div>
                    <label className="form-label-j" htmlFor="startDate">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`form-input-j ${errors.startDate ? 'input-error-j' : ''}`}
                      required
                    />
                    {errors.startDate && <div className="error-message-j">{errors.startDate}</div>}
                  </div>
                  
                  {/* End Date */}
                  <div>
                    <label className="form-label-j" htmlFor="endDate">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={`form-input-j ${errors.endDate ? 'input-error-j' : ''}`}
                      required
                    />
                    {errors.endDate && <div className="error-message-j">{errors.endDate}</div>}
                  </div>
                  
                  {/* Tour Guide Name */}
                  <div>
                    <label className="form-label-j" htmlFor="tourGuideName">
                      Tour Guide Name
                    </label>
                    <input
                      type="text"
                      id="tourGuideName"
                      name="tourGuideName"
                      value={formData.tourGuideName}
                      onChange={handleChange}
                      className={`form-input-j ${errors.tourGuideName ? 'input-error-j' : ''}`}
                      required
                    />
                    {errors.tourGuideName && <div className="error-message-j">{errors.tourGuideName}</div>}
                  </div>
                  
                  {/* Tour Type */}
                  <div>
                    <label className="form-label-j" htmlFor="tourType">
                      Tour Type
                    </label>
                    <select
                      id="tourType"
                      name="tourType"
                      value={formData.tourType}
                      onChange={handleChange}
                      className={`form-input-j ${errors.tourType ? 'input-error-j' : ''}`}
                      required
                    >
                      <option value="">Select Tour Type</option>
                      {tourTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.tourType && <div className="error-message-j">{errors.tourType}</div>}
                  </div>
                </div>
                
                {/* Description */}
                <div className="form-group-full-j">
                  <label className="form-label-j" htmlFor="description">
                    Package Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`textarea-j ${errors.description ? 'input-error-j' : ''}`}
                    required
                    placeholder="Describe the tour package, attractions, and what visitors can expect..."
                  />
                  {errors.description && <div className="error-message-j">{errors.description}</div>}
                </div>
                
                {/* Image Upload */}
                <div className="image-upload-container-j">
                  <label className="form-label-j">
                    Package Image
                  </label>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <div style={{flex: 1}}>
                      <div className={`file-drop-area-j ${errors.image ? 'file-drop-error-j' : ''}`}>
                        <svg className="upload-icon-j" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="upload-text-j">
                          Drag and drop your image here or
                        </p>
                        <input
                          type="file"
                          id="image"
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="file-input-j"
                        />
                        <label
                          htmlFor="image"
                          className="browse-button-j"
                        >
                          Browse Files
                        </label>
                      </div>
                      {errors.image && <div className="error-message-j">{errors.image}</div>}
                    </div>
                    
                    {previewImage && (
                      <div className="preview-container-j">
                        <div className="preview-image-wrapper-j">
                          <img
                            src={previewImage}
                            alt="Package preview"
                            className="preview-image-j"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImage(null);
                              setFormData({...formData, image: null});
                            }}
                            className="remove-button-j"
                          >
                            <svg style={{width: '1rem', height: '1rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Interactive Controls */}
                <div className="button-container-j">
                  <div className="button-group-j">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="preview-button-j"
                    >
                      {showPreview ? "Hide Preview" : "Show Preview"}
                    </button>
                    <button
                      type="reset"
                      className="reset-button-j"
                      onClick={() => {
                        setFormData({
                          packageId: '',
                          name: '',
                          destination: '',
                          price: '',
                          description: '',
                          startDate: '',
                          endDate: '',
                          tourGuideName: '',
                          tourType: '',
                          image: null
                        });
                        setPreviewImage(null);
                        setShowPreview(false);
                        setErrors({});
                      }}
                    >
                      Reset Form
                    </button>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={isSubmitting ? "submit-button-j disabled-button-j" : "submit-button-j"}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <svg className="loading-icon-j" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20">
                          <circle style={{opacity: 0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path style={{opacity: 0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Add Tour Package'
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Right Side - Preview & Interactive Elements */}
            <div className="preview-section-j">
              <div className="sticky-container-j">
                {/* Package Summary - Keeping just the information but removing the heading and completion bar */}
                <div className="summary-j">
                  <h3 className="summary-title-j">Quick Summary</h3>
                  
                  <div style={{marginBottom: '1rem'}}>
                    <div className="summary-item-j">
                      <span className="summary-label-j">Package ID:</span>
                      <span className="summary-value-j">{formData.packageId || 'Not set'}</span>
                    </div>
                    <div className="summary-item-j">
                      <span className="summary-label-j">Destination:</span>
                      <span className="summary-value-j">{formData.destination || 'Not set'}</span>
                    </div>
                    <div className="summary-item-j">
                      <span className="summary-label-j">Price:</span>
                      <span className="summary-value-j">{formData.price ? `$${formData.price}` : 'Not set'}</span>
                    </div>
                    <div className="summary-item-j">
                      <span className="summary-label-j">Type:</span>
                      <span className="summary-value-j">{formData.tourType || 'Not set'}</span>
                    </div>
                    <div className="summary-item-j">
                      <span className="summary-label-j">Duration:</span>
                      <span className="summary-value-j">
                        {calculateDuration() > 0 ? `${calculateDuration()} days` : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Full Preview */}
                {showPreview && (
                  <div className="package-preview-j">
                    <div className="preview-image-container-j">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Package preview" 
                          className="preview-image-large-j"
                        />
                      ) : (
                        <div className="image-placeholder-j">
                          <svg className="placeholder-icon-j" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {formData.tourType && (
                        <span className="type-badge-j">
                          {formData.tourType}
                        </span>
                      )}
                    </div>
                    
                    <div className="preview-content-j">
                      <h3 className="preview-title-j">{formData.name || 'Tour Package Name'}</h3>
                      <p className="preview-destination-j">{formData.destination || 'Destination'}</p>
                      
                      <div className="date-display-j">
                        <svg className="date-icon-j" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="date-text-j">
                          {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Start Date'} - {formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'End Date'}
                        </span>
                      </div>
                      
                      <p className="preview-description-j">
                        {formData.description || 'No description provided'}
                      </p>
                      
                      <div className="preview-footer-j">
                        <span className="preview-price-j">
                          {formData.price ? `$${formData.price}` : '$0.00'}
                        </span>
                        <span className="guide-text-j">
                          Guide: {formData.tourGuideName || 'Not assigned'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Help Text */}
                <div className="tips-container-j">
                  <h3 className="tips-title-j">Tips:</h3>
                  <ul className="tips-list-j">
                    <li className="tips-item-j">• Add high-quality images for better visual appeal</li>
                    <li className="tips-item-j">• Write detailed descriptions to increase bookings</li>
                    <li className="tips-item-j">• Set competitive pricing based on market research</li>
                    <li className="tips-item-j">• Click "Show Preview" to see how your package will look</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;