import React from 'react';
import { Button } from 'antd';
import './BannerSectionGuideBook.css'; // Assuming you have a CSS file for styles

const BannerSectionHotelBook = ({ bannerImage }) => {
  // Default image if none provided
  const backgroundImage = bannerImage || "https://images.pexels.com/photos/6129991/pexels-photo-6129991.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
  
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
        <h1>Plan it. Book it. Get guided</h1>
        <p>Guides that get you</p>
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