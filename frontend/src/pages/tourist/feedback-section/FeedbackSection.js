import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FeedbackSection.css';

const FeedbackSection = () => {
  const navigate = useNavigate();

  const handleFeedbackClick = () => {
    // Navigate to the feedback form page
    navigate('/Tourist/feedback');
  };

  return (
    <div className="feedback-section">
      <div className="feedback-container">
        <h2>We Value Your Feedback</h2>
        <p>Share your thoughts with us and help us improve our services!</p>
        
        <button className="feedback-button" onClick={handleFeedbackClick}>
          Give Feedback
        </button>
      </div>
    </div>
  );
};

export default FeedbackSection;