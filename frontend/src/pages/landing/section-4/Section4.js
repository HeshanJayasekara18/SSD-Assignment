import React from 'react';
import './Section4.css';
import { FaHotel, FaCar, FaUserFriends, FaMapMarkedAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Section4 = () => {
  const navigate = useNavigate();

  const destinations = [
    {
      name: "Sigiriya",
      description: "Ancient 'Lion Rock' fortress, famed for frescoes and views.",
    },
    {
      name: "Ella",
      description: "Scenic hill station with tea plantations",
    },
    {
      name: "Galle",
      description: "Historic fort city with colonial architecture",
    },
    {
      name: "Arugam Bay",
      description: "Surfing paradise on the east coast",
    }
  ];

  const planCategories = [
    {
      name: "Hotels",
      description: "Find the perfect stay",
      icon: <FaHotel />,
      path: "/hotel-booking"
    },
    {
      name: "Transportation",
      description: "Book your ride",
      icon: <FaCar />,
      path: "/vehicle-booking"
    },
    {
      name: "Tour Guides",
      description: "Explore with locals",
      icon: <FaUserFriends />,
      path: "/guide-booking"
    },
    {
      name: "Destinations",
      description: "Plan your route",
      icon: <FaMapMarkedAlt />,
      path: "/destinations"
    }
  ];

  return (
    <div className="section3Container">
      <div className="popularDestinations">
        <h2 className="sectionTitle">Popular Destinations</h2>
        <p className="sectionSubtitle">Explore the most beloved places in Sri Lanka</p>

        <div className="destinationsGrid">
          {destinations.map((destination, index) => (
            <div key={index} className="destinationCard">
              <div className={`destinationImage ${destination.name.toLowerCase().replace(/\s/g, '-')}`}>
                <div className="destinationOverlay">
                  <h3>{destination.name}</h3>
                  <p>{destination.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="viewAllButton">View All Destinations</button>
      </div>

      <div className="planYourTrip">
        <div className="planHeader">
          <h2 className="sectionTitle">Plan Your Trip</h2>
          <p className="sectionSubtitle">Create your perfect Sri Lankan adventure</p>
        </div>

        <div className="planOptionsContainer">
          {planCategories.map((category, index) => (
            <div 
              key={index} 
              className="planOption" 
              onClick={() => navigate(category.path)}
            >
              <div className="planOptionIcon">
                {category.icon}
              </div>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <button className="planOptionButton">Explore</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section4;
