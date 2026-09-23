// FRONTEND: FeedbackForm.jsx

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import './FeedbackForm.css';

const FeedbackForm = () => {
  // Get IDs from localStorage on component mount
  const [touristID, setTouristID] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Get touristID from localStorage when component mounts
  useEffect(() => {
    const storedTouristID = localStorage.getItem('touristID');
    
    if (storedTouristID) {
      setTouristID(storedTouristID);
    } else {
      setSubmitStatus({ 
        success: false, 
        message: 'Tourist ID not found. Please log in again.' 
      });
    }
  }, []);

  const handleRatingClick = (selectedRating) => setRating(selectedRating);
  const handleRatingHover = (hoveredValue) => setHoveredRating(hoveredValue);
  const handleRatingLeave = () => setHoveredRating(0);
  const handleCommentChange = (e) => setComment(e.target.value);
  const handleServiceTypeChange = (e) => setServiceType(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!serviceType) {
      setSubmitStatus({ success: false, message: 'Please select a service type' });
      return;
    }

    if (rating === 0) {
      setSubmitStatus({ success: false, message: 'Please select a rating' });
      return;
    }

    // Check if we have the touristID from localStorage
    if (!touristID) {
      setSubmitStatus({ success: false, message: 'Tourist ID not found. Please log in again.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:4000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          touristID, // Sending the ID from localStorage directly
          rating,
          comment
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        setSubmitStatus({ success: true, message: 'Thank you for your feedback!' });
        setRating(0);
        setServiceType('');
        setComment('');
      } else {
        throw new Error(responseData.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      setSubmitStatus({ 
        success: false, 
        message: error.message || 'An error occurred while submitting feedback' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-container-r">
      <h2 className="feedback-heading-r">Tour Feedback</h2>
      <p className="feedback-subheading-r">Please share your experience with us</p>

      <form className="feedback-form-r" onSubmit={handleSubmit}>
        <div className="form-group-r">
          <label htmlFor="serviceType" className="form-label-r">Service Type:</label>
          <select
            id="serviceType"
            className="form-select-r"
            value={serviceType}
            onChange={handleServiceTypeChange}
            required
          >
            <option value="">Select Service Type</option>
            <option value="TourGuide">Tour Guide</option>
            <option value="HotelRoom">Hotel Room</option>
            <option value="Vehicle">Vehicle</option>
          </select>
        </div>

        <div className="rating-container-r">
          <p className="rating-label-r">Rate your experience:</p>
          <div className="stars-container-r" onMouseLeave={handleRatingLeave}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                size={32}
                onClick={() => handleRatingClick(value)}
                onMouseEnter={() => handleRatingHover(value)}
                className={`star-icon-r ${(hoveredRating || rating) >= value ? 'star-filled-r' : 'star-empty-r'}`}
              />
            ))}
          </div>
          <span className="rating-text-r">{rating > 0 ? `${rating} of 5 stars` : 'Select a rating'}</span>
        </div>

        <div className="comment-container-r">
          <label htmlFor="comment" className="comment-label-r">Comments (Optional):</label>
          <textarea
            id="comment"
            className="comment-textarea-r"
            value={comment}
            onChange={handleCommentChange}
            placeholder="Tell us more about your experience..."
            rows={5}
          />
        </div>

        {submitStatus && (
          <div className={`status-message-r ${submitStatus.success ? 'success-r' : 'error-r'}`}>
            {submitStatus.message}
          </div>
        )}

        <button 
          type="submit" 
          className="submit-button-r" 
          disabled={isSubmitting || !touristID}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;