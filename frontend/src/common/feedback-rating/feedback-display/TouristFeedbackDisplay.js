// TouristFeedbackDisplay.js
import React, { useState, useEffect } from 'react';
import './TouristFeedbackDisplay.css';

const TouristFeedbackDisplay = ({ touristID }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Service type display mapping
  const serviceTypeLabels = {
    'TourGuide': 'Tour Guide',
    'HotelRoom': 'Hotel Room',
    'Vehicle': 'Vehicle'
  };

  // Star rating renderer
  const renderStars = (rating) => {
    return Array(5).fill().map((_, index) => (
      <span 
        key={index} 
        className={`star-r ${index < rating ? 'filled-r' : 'empty-r'}`}
      >
        ★
      </span>
    ));
  };

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        // Fetch all feedbacks for the tourist
        const response = await fetch(`/api/feedback?touristID=${touristID}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch feedbacks');
        }
        
        const data = await response.json();
        setFeedbacks(data.feedbacks.filter(feedback => feedback.touristID._id === touristID));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [touristID]);

  if (loading) {
    return <div className="loading-r">Loading your feedbacks...</div>;
  }

  if (error) {
    return <div className="error-r">Error: {error}</div>;
  }

  if (feedbacks.length === 0) {
    return <div className="no-feedbacks-r">You haven't submitted any feedbacks yet.</div>;
  }

  return (
    <div className="feedback-display-container-r">
      <h2 className="feedback-display-title-r">Your Submitted Feedbacks</h2>
      
      {feedbacks.map((feedback) => (
        <div key={feedback._id} className="feedback-card-r">
          <div className="feedback-header-r">
            <h3 className="service-type-r">{serviceTypeLabels[feedback.serviceType]}</h3>
            <span className="feedback-date-r">
              {new Date(feedback.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="rating-display-r">
            {renderStars(feedback.rating)}
            <span className="rating-text-r">{feedback.rating} of 5</span>
          </div>
          
          {feedback.comment && (
            <div className="comment-section-r">
              <h4 className="section-title-r">Your Feedback:</h4>
              <p className="comment-text-r">{feedback.comment}</p>
            </div>
          )}
          
          <div className="response-section-r">
            <h4 className="section-title-r">Admin Response:</h4>
            {feedback.adminResponse ? (
              <p className="response-text-r">{feedback.adminResponse}</p>
            ) : (
              <p className="pending-response-r">No response yet</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TouristFeedbackDisplay;