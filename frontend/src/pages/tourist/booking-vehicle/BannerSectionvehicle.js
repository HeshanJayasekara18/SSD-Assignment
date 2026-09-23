import React from 'react';
import { Button } from 'antd';

const BannerSectionvehicle = ({ bannerImage }) => {
  // Default image if none provided
  const backgroundImage = bannerImage || "https://driving-tests.org/wp-content/uploads/2012/05/leisure-trip.webp";
  
  const scrollToTourPlan = () => {
    const planSection = document.getElementById('vehicle-booking-plan');
    if (planSection) {
      planSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div 
      className="banner-container" 
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="banner-content">
        <h1>Destination Ready. Vehicle Steady</h1>
        <p>Gear up your journey</p>
        <Button
          type="primary"
          size="large"
          className="book-button"
          onClick={scrollToTourPlan}
        >
          Book Now
        </Button>
      </div>
    </div>
  );
};

export default BannerSectionvehicle;