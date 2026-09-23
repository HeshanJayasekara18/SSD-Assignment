import React from 'react';
import { Button } from 'antd';

const BannerSection = () => {
  // Function to scroll to the tour planning section
  const scrollToTourPlan = () => {
    const planSection = document.getElementById('tour-plan-section');
    if (planSection) {
      planSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="banner-container">
      <div className="banner-content">
        <h1>From Dream To Destination</h1>
        <p>Plan Your Own Tour</p>
        <Button 
          type="primary" 
          size="large" 
          className="book-button"
          onClick={scrollToTourPlan}
        >
          Plan Now
        </Button>
      </div>
    </div>
  );
};

export default BannerSection;