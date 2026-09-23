import React from 'react';
import { Button } from 'antd';

const BannerSectionvehicle = ({ bannerImage }) => {
  // Default image if none provided
  const backgroundImage = bannerImage || "https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
  
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
        <h1>Your Journey is Ready</h1>
        <p>Gear up your journey</p>
        <Button
          type="primary"
          size="large"
          className="book-button"
          onClick={scrollToTourPlan}
        >
          Pay Now
        </Button>
      </div>
    </div>
  );
};

export default BannerSectionvehicle;