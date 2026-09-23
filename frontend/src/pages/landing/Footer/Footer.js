// Footer.jsx
import React from 'react';
import './Footer.css';
import weblogo from '../../../images/logo.png';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="siteFooter">
      <div className="footerWave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#2c7a7b" fillOpacity="1" d="M0,192L48,202.7C96,213,192,235,288,229.3C384,224,480,192,576,181.3C672,171,768,181,864,197.3C960,213,1056,235,1152,229.3C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="footerContent">
        <div className="footerColumns">
          <div className="footerColumn">
            <img src={weblogo} alt="Logo" className="footerLogo" />
            <p className="footerTagline">Your Gateway to Sri Lankan Adventures</p>
            <div className="socialLinks">
              <a href="#" className="socialIcon"><FaFacebookF /></a>
              <a href="#" className="socialIcon"><FaTwitter /></a>
              <a href="#" className="socialIcon"><FaInstagram /></a>
              <a href="#" className="socialIcon"><FaYoutube /></a>
            </div>
          </div>
          
          <div className="footerColumn">
            <h3>Quick Links</h3>
            <ul className="footerLinks">
              <li><a href="#">Home</a></li>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Plan Your Tour</a></li>
              <li><a href="#">Our Packages</a></li>
              <li><a href="#">Gallery</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
          
          <div className="footerColumn">
            <h3>Tourist Services</h3>
            <ul className="footerLinks">
              <li><a href="#">Hotel Booking</a></li>
              <li><a href="#">Vehicle Rental</a></li>
              <li><a href="#">Tour Guides</a></li>
              <li><a href="#">Airport Pickup</a></li>
              <li><a href="#">Customized Tours</a></li>
              <li><a href="#">Adventure Activities</a></li>
            </ul>
          </div>
          
          <div className="footerColumn">
            <h3>Contact Us</h3>
            <ul className="contactInfo">
              <li><FaMapMarkerAlt className="contactIcon" /> 123 Tourism Road, Colombo, Sri Lanka</li>
              <li><FaPhoneAlt className="contactIcon" /> +94 11 234 5678</li>
              <li><FaEnvelope className="contactIcon" /> info@srilankatours.com</li>
            </ul>
            <div className="newsletter">
              <h4>Subscribe to Newsletter</h4>
              <div className="subscribeForm">
                <input type="email" placeholder="Enter your email" />
                <button type="submit">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footerBottom">
          <p className="copyright">© 2025 Sri Lanka Tours. All rights reserved.</p>
          <div className="footerBottomLinks">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;