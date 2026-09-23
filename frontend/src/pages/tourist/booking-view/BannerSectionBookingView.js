import React from 'react';
import { Button } from 'antd';
import './BannerSectionGuideBook.css'; // Assuming you have a CSS file for styles

const BannerSectionHotelBook = ({ bannerImage }) => {
  // Default image if none provided
  const backgroundImage = bannerImage || "https://cdn.pixabay.com/photo/2015/01/02/00/01/telephone-586268_1280.jpg";
  
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
        <h1>All your reservations at your fingertips.</h1>
        <p>Your travel plans, simplified</p>
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

export default BannerSectionHotelBook;