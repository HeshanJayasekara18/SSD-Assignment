
import weblogo from '../../../images/logo.png';
import './BookingNavAfterLog.css';
import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from 'react';



const BookingNavAfterLog = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  
  return (
    <div className="landingLandingPage-h">
      <nav className="landingNavigation-h">
        <div className="landingLogo-h"><img src={weblogo} alt="Logo" /></div>
        <div className="landingNavLinks-h">
          <span href="#" className="landingNavLink-h" onClick={() => navigate('./Home')}>Home</span>
          <span className="landingNavLink-h" onClick={() => navigate('/tourist')}>Plan your tour</span>

          <span className="landingNavLink-h" onClick={() => navigate('./package')}>Our Packages</span>
          <span className="landingNavLink-h" onClick={() => navigate('./gallary')}>Gallery</span>
          <span className="landingNavLink-h" onClick={() => navigate('/tourist')}>Contact</span>
          <span className="landingNavLink-h" onClick={() => navigate('/tourist')}>Join with us</span>
          <span className="landingNavLink-h" onClick={() => navigate('./booking-view')}>Your Bookings</span>
        </div>
        <div className="landingRegbutton-h">
          
            <div className="dropdown-container-h" ref={dropdownRef}>
            <button className="account-btn-h" onClick={toggleDropdown}>
            Your Account
             </button>
        {isOpen && (
            <div className="dropdown-menu-h">
            <a href="#"onClick={() => navigate('./Profile')}>Your Profile</a>
            <a href="#" onClick={() => navigate('./booking-view')}>Your Bookings</a>
            <a href="#">Your Payments</a>
            <a href="#" onClick={() => navigate('/#')}>Sign Out</a>
            </div>
        )}
        </div>
         
        </div>
      </nav>
</div>

  )   
};

export default BookingNavAfterLog;