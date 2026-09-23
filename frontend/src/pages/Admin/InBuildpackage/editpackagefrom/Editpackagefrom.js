import React, { useEffect, useState } from 'react';
import './EditPackagefrom.css'; // You'll need to create this CSS file
import axios from 'axios';

function SimplifiedTourForm({packageData}) {
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (packageData) {
      setFormData({
        packageId: packageData.packageId || '',
        name: packageData.name || '',
        destination: packageData.destination || '',
        price: packageData.price || '',
        description: packageData.description || '',
        startDate: packageData.startDate ? packageData.startDate.slice(0, 10) : '', // Format Fix
        endDate: packageData.endDate ? packageData.endDate.slice(0, 10) : '', // Format Fix
        tourGuideName: packageData.tourGuideName || '',
        tourType: packageData.tourType || '',
        image: null
      });
  
      if (packageData.image) {
        setPreviewImage(packageData.image);
      }
    }
  }, [packageData]);
  

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

  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const [showPreview, setShowPreview] = useState(false);

  const tourTypes = [
    'Adventure', 'Beach', 'Cultural', 'Family', 'Luxury', 
    'Wildlife', 'Cruise', 'Hiking', 'Historical', 'Honeymoon'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error for this field when user changes value
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear image validation error if it exists
      if (validationErrors.image) {
        setValidationErrors({
          ...validationErrors,
          image: ''
        });
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required validation for all fields
    Object.keys(formData).forEach(key => {
      if (key === 'image') {
        // Only require image if no previewImage exists (could be existing image)
        if (!formData.image && !previewImage) {
          errors.image = 'Please select an image for the package';
        }
      } else if (!formData[key]) {
        errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    });
    
    // Validate price is a positive number
    if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) <= 0)) {
      errors.price = 'Price must be a positive number';
    }
    
    // We removed the date comparison validation as requested
    // Only checking that dates are provided
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validate form before submitting
      if (!validateForm()) {
        // Scroll to the first error
        const firstErrorField = document.querySelector('.error-message-e');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      
      setIsSubmitting(true);
  
      try {
          const formDataToSend = new FormData();
          formDataToSend.append("packageId", formData.packageId);
          formDataToSend.append("name", formData.name);
          formDataToSend.append("destination", formData.destination);
          formDataToSend.append("price", formData.price);
          formDataToSend.append("description", formData.description);
          formDataToSend.append("startDate", formData.startDate);
          formDataToSend.append("endDate", formData.endDate);
          formDataToSend.append("tourGuideName", formData.tourGuideName);
          formDataToSend.append("tourType", formData.tourType);
          
          if (formData.image) {
              formDataToSend.append("image", formData.image);
          }
  
          const response = await axios.put(
              `http://localhost:4000/api/tourPackage/${packageData.tp_Id}`,
              formDataToSend,
              {
                  headers: {
                      "Content-Type": "multipart/form-data",
                  },
              }
          );
  
          console.log('Server response:', response.data);
          setSubmitMessage({ type: 'success', message: 'Tour package updated successfully!' });
          
          // Show success message as alert also
          alert("Tour package updated successfully!");
  
      } catch (error) {
          console.error("Error updating package:", error);
          setSubmitMessage({ 
              type: 'error', 
              message: error.response?.data?.message || 'Failed to update package.' 
          });
      } finally {
          setIsSubmitting(false);
      }
  };
  
  
  return (
    <div className="form-container-e">
      <div className="form-card-e">
        <div className="form-header-e">
          <h1 className="form-title-e">Update Tour Package</h1>
          <p className="form-subtitle-e">Edit the form below to update the tour package</p>
        </div>
        
        {submitMessage.message && (
          <div className={`form-message-e ${submitMessage.type === 'success' ? 'success-message-e' : 'error-message-e'}`}>
            {submitMessage.message}
          </div>
        )}
        
        <div className="form-body-e">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid-e">
              <div className={`form-group-e ${validationErrors.packageId ? 'has-error-e' : ''}`}>
                <label className="form-label-e" htmlFor="packageId">
                  Package ID <span className="required-mark-e">*</span>
                </label>
                <input
                  type="text"
                  id="packageId"
                  name="packageId"
                  value={formData.packageId}
                  onChange={handleChange}
                  className={`form-input-e ${validationErrors.packageId ? 'error-input-e' : ''}`}
                  required
                />
                {validationErrors.packageId && (
                  <p className="error-message-e">{validationErrors.packageId}</p>
                )}
              </div>
              
              <div className={`form-group-e ${validationErrors.name ? 'has-error-e' : ''}`}>
                <label className="form-label-e" htmlFor="name">
                  Package Name <span className="required-mark-e">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input-e ${validationErrors.name ? 'error-input-e' : ''}`}
                  required
                />
                {validationErrors.name && (
                  <p className="error-message-e">{validationErrors.name}</p>
                )}
              </div>
              
              <div className={`form-group-e ${validationErrors.destination ? 'has-error-e' : ''}`}>
                <label className="form-label-e" htmlFor="destination">
                  Destination <span className="required-mark-e">*</span>
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  className={`form-input-e ${validationErrors.destination ? 'error-input-e' : ''}`}
                  required
                />
                {validationErrors.destination && (
                  <p className="error-message-e">{validationErrors.destination}</p>
                )}
              </div>
              
              <div className={`form-group-e ${validationErrors.price ? 'has-error-e' : ''}`}>
                <label className="form-label-e" htmlFor="price">
                  Price <span className="required-mark-e">*</span>
                </label>
                <div className="price-input-container-e">
                  <span className="price-symbol-e">$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`price-input-e ${validationErrors.price ? 'error-input-e' : ''}`}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                {validationErrors.price && (
                  <p className="error-message-e">{validationErrors.price}</p>
                )}
              </div>
              
              <div className={`form-group-e ${validationErrors.startDate ? 'has-error-e' : ''}`}>
                <label className="form-label-e" htmlFor="startDate">
                  Start Date <span className="required-mark-e">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`form-input-e ${validationErrors.startDate ? 'error-input-e' : ''}`}
                  required
                />
                {validationErrors.startDate && (
                  <p className="error-message-e">{validationErrors.startDate}</p>
                )}
              </div>
              
              <div className={`form-group-e ${validationErrors.endDate ? 'has-error-e' : ''}`}>
                <label className="form-label-e" htmlFor="endDate">
                  End Date <span className="required-mark-e">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`form-input-e ${validationErrors.endDate ? 'error-input-e' : ''}`}
                  required
                />
                {validationErrors.endDate && (
                  <p className="error-message-e">{validationErrors.endDate}</p>
                )}
              </div>
              
              <div className={`form-group-e ${validationErrors.tourGuideName ? 'has-error-e' : ''}`}>
                <label className="form-label-e" htmlFor="tourGuideName">
                  Tour Guide Name <span className="required-mark-e">*</span>
                </label>
                <input
                  type="text"
                  id="tourGuideName"
                  name="tourGuideName"
                  value={formData.tourGuideName}
                  onChange={handleChange}
                  className={`form-input-e ${validationErrors.tourGuideName ? 'error-input-e' : ''}`}
                  required
                />
                {validationErrors.tourGuideName && (
                  <p className="error-message-e">{validationErrors.tourGuideName}</p>
                )}
              </div>
              
              <div className={`form-group-e ${validationErrors.tourType ? 'has-error-e' : ''}`}>
                <label className="form-label-e" htmlFor="tourType">
                  Tour Type <span className="required-mark-e">*</span>
                </label>
                <select
                  id="tourType"
                  name="tourType"
                  value={formData.tourType}
                  onChange={handleChange}
                  className={`form-select-e ${validationErrors.tourType ? 'error-input-e' : ''}`}
                  required
                >
                  <option value="">Select Tour Type</option>
                  {tourTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {validationErrors.tourType && (
                  <p className="error-message-e">{validationErrors.tourType}</p>
                )}
              </div>
            </div>
            
            <div className={`form-group-e full-width-e ${validationErrors.description ? 'has-error-e' : ''}`}>
              <label className="form-label-e" htmlFor="description">
                Package Description <span className="required-mark-e">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`form-textarea-e ${validationErrors.description ? 'error-input-e' : ''}`}
                required
                placeholder="Describe the tour package, attractions, and what visitors can expect..."
              />
              {validationErrors.description && (
                <p className="error-message-e">{validationErrors.description}</p>
              )}
            </div>
            
            <div className={`form-group-e full-width-e ${validationErrors.image ? 'has-error-e' : ''}`}>
              <label className="form-label-e">
                Package Image <span className="required-mark-e">*</span>
              </label>
              <div className={`image-upload-container-e ${validationErrors.image ? 'error-border-e' : ''}`}>
                <div className="image-upload-area-e">
                  <svg className="upload-icon-e" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="upload-text-e">
                    Drag and drop your image here or
                  </p>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden-input-e"
                  />
                  <label
                    htmlFor="image"
                    className="browse-button-e"
                  >
                    Browse Files
                  </label>
                </div>
                
                {previewImage && (
                  <div className="image-preview-container-e">
                    <div className="image-preview-e">
                      <img
                        src={previewImage}
                        alt="Package preview"
                        className="preview-image-e"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData({...formData, image: null});
                        }}
                        className="remove-image-button-e"
                      >
                        <svg className="remove-icon-e" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {validationErrors.image && (
                <p className="error-message-e">{validationErrors.image}</p>
              )}
            </div>
            
            {showPreview && (
              <div className="package-preview-e">
                <div className="preview-image-container-e">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Package preview" 
                      className="preview-image-full-e"
                    />
                  ) : (
                    <div className="preview-placeholder-e">
                      <svg className="placeholder-icon-e" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {formData.tourType && (
                    <span className="tour-type-badge-e">
                      {formData.tourType}
                    </span>
                  )}
                </div>
                
                <div className="preview-content-e">
                  <h3 className="preview-title-e">{formData.name || 'Tour Package Name'}</h3>
                  <p className="preview-destination-e">{formData.destination || 'Destination'}</p>
                  
                  <div className="preview-dates-e">
                    <svg className="date-icon-e" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Start Date'} - {formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'End Date'}
                    </span>
                  </div>
                  
                  <p className="preview-description-e">
                    {formData.description || 'No description provided'}
                  </p>
                  
                  <div className="preview-footer-e">
                    <span className="preview-price-e">
                      {formData.price ? `$${formData.price}` : '$0.00'}
                    </span>
                    <span className="preview-guide-e">
                      Guide: {formData.tourGuideName || 'Not assigned'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="form-actions-e">
              <button
                type="button"
                className="preview-button-e"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                type="submit"
                className="update-button-e"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="button-loading-e">
                    <svg className="loading-spinner-e" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="spinner-track-e" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="spinner-path-e" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Update Tour Package'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SimplifiedTourForm;