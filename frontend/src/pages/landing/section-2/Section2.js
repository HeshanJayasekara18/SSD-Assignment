// Section2.jsx
import React from 'react';
import './Section2.css';
import { FaUmbrellaBeach, FaTree, FaLandmark, FaHiking } from 'react-icons/fa';

const Section2 = () => {
  return (
    <div className="section2Container">
      <div className="aboutSriLanka">
        <div className="aboutTextContainer">
          <h2 className="sectionTitle">Discover Sri Lanka</h2>
          <p className="sectionSubtitle">Paradise Island with a rich cultural heritage</p>
          <div className="aboutDescription">
            <p>Sri Lanka, the pearl of the Indian Ocean, offers an incredible diversity of experiences in a compact island. From ancient ruins and lush tea plantations to pristine beaches and abundant wildlife, this tropical paradise has something for every traveler.</p>
            <p>With over 2,000 years of recorded history, 8 UNESCO World Heritage Sites, and incredible biodiversity, Sri Lanka delivers unforgettable experiences with its warm hospitality and rich culture.</p>
          </div>
          
          <div className="highlightsContainer">
            <div className="highlightItem">
              <div className="iconContainer">
                <FaUmbrellaBeach className="highlightIcon" />
              </div>
              <div className="highlightText">
                <h4>Beautiful Beaches</h4>
                <p>1,340km of pristine coastline</p>
              </div>
            </div>
            
            <div className="highlightItem">
              <div className="iconContainer">
                <FaTree className="highlightIcon" />
              </div>
              <div className="highlightText">
                <h4>National Parks</h4>
                <p>26 national parks with diverse wildlife</p>
              </div>
            </div>
            
            <div className="highlightItem">
              <div className="iconContainer">
                <FaLandmark className="highlightIcon" />
              </div>
              <div className="highlightText">
                <h4>Heritage Sites</h4>
                <p>8 UNESCO World Heritage sites</p>
              </div>
            </div>
            
            <div className="highlightItem">
              <div className="iconContainer">
                <FaHiking className="highlightIcon" />
              </div>
              <div className="highlightText">
                <h4>Adventure</h4>
                <p>Hiking, surfing, diving & more</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="imageGalleryContainer">
          <div className="imageGrid">
            <div className="imageBox imageBox1"></div>
            <div className="imageBox imageBox2"></div>
            <div className="imageBox imageBox3"></div>
            <div className="imageBox imageBox4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section2;