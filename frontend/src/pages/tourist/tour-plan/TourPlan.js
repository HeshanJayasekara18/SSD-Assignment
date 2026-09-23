import "./TourPlan.css";
import { useNavigate } from "react-router-dom";
import React, { useState } from 'react';
import { DatePicker, Select, Card, Row, Col, Button, Input } from 'antd';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import dayjs from 'dayjs';
import 'leaflet/dist/leaflet.css';
import BookingFooter from "../booking-footer/BookingFooter";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { SearchOutlined } from '@ant-design/icons';

import RoutingMachine from './RoutingMachineTourPlan';
import BannerSection from './BannerSection';
import TourProgressSteps from '../tour-progress-steps/TourProgressSteps';

const pinIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const { RangePicker } = DatePicker;
const { Search } = Input;
const SRI_LANKA_CENTER = [7.8731, 80.7718];

// Extended list of Sri Lankan cities with coordinates
const destinations = [
  { name: 'Colombo', coordinates: [6.9271, 79.8612] },
  { name: 'Kandy', coordinates: [7.2906, 80.6337] },
  { name: 'Galle', coordinates: [6.0535, 80.2210] },
  { name: 'Sigiriya', coordinates: [7.9570, 80.7603] },
  { name: 'Nuwara Eliya', coordinates: [6.9497, 80.7891] },
  { name: 'Anuradhapura', coordinates: [8.3114, 80.4037] },
  { name: 'Polonnaruwa', coordinates: [7.9403, 81.0189] },
  { name: 'Trincomalee', coordinates: [8.5874, 81.2152] },
  { name: 'Jaffna', coordinates: [9.6615, 80.0255] },
  { name: 'Yala', coordinates: [6.3774, 81.4998] },
  // Additional cities in Sri Lanka
  { name: 'Negombo', coordinates: [7.2061, 79.8397] },
  { name: 'Batticaloa', coordinates: [7.7181, 81.7001] },
  { name: 'Dambulla', coordinates: [7.8674, 80.6495] },
  { name: 'Matara', coordinates: [5.9496, 80.5353] },
  { name: 'Ella', coordinates: [6.8667, 81.0466] },
  { name: 'Mirissa', coordinates: [5.9483, 80.4584] },
  { name: 'Bentota', coordinates: [6.4218, 79.9959] },
  { name: 'Hikkaduwa', coordinates: [6.1395, 80.1063] },
  { name: 'Arugam Bay', coordinates: [6.8391, 81.8290] },
  { name: 'Tangalle', coordinates: [6.0231, 80.7991] },
  { name: 'Haputale', coordinates: [6.7719, 80.9544] },
  { name: 'Kuruwita', coordinates: [6.7833, 80.3667] },
  { name: 'Badulla', coordinates: [6.9839, 81.0550] },
  { name: 'Ratnapura', coordinates: [6.6830, 80.3990] },
  { name: 'Kurunegala', coordinates: [7.4833, 80.3667] },
  { name: 'Mannar', coordinates: [8.9833, 79.9000] },
  { name: 'Matale', coordinates: [7.4717, 80.6233] },
  { name: 'Kalpitiya', coordinates: [8.2333, 79.7667] },
  { name: 'Puttalam', coordinates: [8.0367, 79.8397] },
  { name: 'Vavuniya', coordinates: [8.7514, 80.4994] },
  { name: 'Kilinochchi', coordinates: [9.3833, 80.4000] },
  { name: 'Hambantota', coordinates: [6.1240, 81.1185] },
  { name: 'Kalutara', coordinates: [6.5854, 79.9607] },
  { name: 'Hatton', coordinates: [6.8916, 80.5958] },
  { name: 'Mullaitivu', coordinates: [9.2667, 80.8167] },
  { name: 'Welimada', coordinates: [6.9060, 80.9130] },
  { name: 'Kegalle', coordinates: [7.2513, 80.3464] },
  { name: 'Ampara', coordinates: [7.3016, 81.6747] },
  { name: 'Horton Plains', coordinates: [6.8000, 80.8333] },
  { name: 'Kataragama', coordinates: [6.4145, 81.3335] },
  { name: 'Wilpattu', coordinates: [8.4547, 80.0419] },
  { name: 'Udawalawe', coordinates: [6.4418, 80.8986] },
  { name: 'Minneriya', coordinates: [8.0364, 80.9008] },
  { name: 'Wasgamuwa', coordinates: [7.7131, 80.9428] },
  { name: 'Pidurangala', coordinates: [7.9689, 80.7569] },
  { name: 'Adam\'s Peak', coordinates: [6.8096, 80.4994] },
];

const trendingDestinations = [
  {
    name: 'Kandy',
    image: 'https://thatswhatshehad.com/wp-content/uploads/2018/07/chathura-anuradha-subasinghe-40uQmE9Zq8g-unsplash-1536x1024.jpg'
  },
  {
    name: 'Colombo',
    image: 'https://www.atlys.com/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FW3Iz4WACAy2J0qT0cCT3xA%2Fdidi%2Farticles%2Fe40cjul42oiwuiost3ftloo7%2Fpublic&w=1920&q=75'
  },
  {
    name: 'Nuwara Eliya',
    image: 'https://images.unsplash.com/photo-1546708973-b339540b5162?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2787&q=80'
  },
  {
    name: 'Mirissa',
    image: 'https://cdn.shortpixel.ai/spai/w_1157+q_+ret_img+to_webp/https://www.theglobetrottergp.com/wp-content/uploads/2019/05/oDZ1LpuSxCdJQd5UhbjSA_thumb_60bb.jpg'
  },
  {
    name: 'Ella',
    image: 'https://www.srilankawidetours.com/wp-content/uploads/2019/04/Ella-Sri-Lanka-8-Fantastic-things-to-do-in-Ella-Sri-Lanka-e1554930904131.jpg'
  },
];

const TourPlan = () => {
  const navigate = useNavigate();
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [totalDistance, setTotalDistance] = useState(null);
  const [totalDays, setTotalDays] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDestinations, setFilteredDestinations] = useState(destinations);

  // Filter destinations based on search term
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value) {
      setFilteredDestinations(destinations);
    } else {
      const filtered = destinations.filter(dest => 
        dest.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDestinations(filtered);
    }
  };

  const handleDestinationSelect = (value) => {
    const newDestination = destinations.find(dest => dest.name === value);
    if (newDestination && !selectedDestinations.some(dest => dest.name === value)) {
      setSelectedDestinations([...selectedDestinations, newDestination]);
    }
  };

  const handleDestinationRemove = (destinationName) => {
    setSelectedDestinations(selectedDestinations.filter(dest => dest.name !== destinationName));
  };

  const handleTrendingDestinationClick = (destName) => {
    const newDestination = destinations.find(dest => dest.name === destName);
    if (newDestination && !selectedDestinations.some(dest => dest.name === destName)) {
      setSelectedDestinations([...selectedDestinations, newDestination]);
    }
  };

  const handleContinue = async () => {
    if (!dateRange || !selectedDestinations.length) {
      setError("Please select both dates and destinations");
      return;
    }
  
    setLoading(true);
    setError(null);
    
    try {
      // Get user info from localStorage or your auth context
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
      const userID = userInfo.userID || localStorage.getItem('userID');
      const touristID = userInfo.touristID || localStorage.getItem('touristID');
      
      if (!userID || !touristID) {
        setError("User not authenticated. Please log in first.");
        setLoading(false);
        return;
      }
      
      // Create a comma-separated string of destinations
      const destinationList = selectedDestinations.map(dest => dest.name).join(", ");
      
      // Create tour data object with required fields
      const tourData = {
        tourID: uuidv4(),
        destination: destinationList,
        start_date: dateRange[0].toDate(),
        end_date: dateRange[1].toDate(),
        touristID: touristID,
        userID: userID
      };
      
      console.log("Sending tour data:", tourData);
      
      // Save tour data to database
      const response = await axios.post("http://localhost:4000/api/tour", tourData, {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Tour created successfully:', response.data);
      console.log("Tour ID:", response.data.tourID);
      
      // Navigate to vehicle booking page with the tour ID
      navigate('/Tourist/vehicle-book', { 
        state: { 
          tourID: response.data.tourID || tourData.tourID,
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
          destinations: destinationList,
          totalDistance,
          totalDays
        } 
      });
  
    } catch (error) {
      console.error("API Error:", error);
      if (error.response) {
        console.error("Error Response:", error.response.data);
        setError(`Failed to save your tour plan: ${error.response.data.message || "Unknown error"}`);
      } else {
        setError("Failed to save your tour plan. Please try again.");
      }
      
      // Fallback approach - continue with client-side ID if server fails
      if (error.response && error.response.status === 500) {
        console.log("Continuing despite API error with fallback tourID");
        const fallbackTourID = uuidv4();
        navigate('/Tourist/vehicle-book', { 
          state: { 
            tourID: fallbackTourID,
            startDate: dateRange[0].format('YYYY-MM-DD'),
            endDate: dateRange[1].format('YYYY-MM-DD'),
            destinations: selectedDestinations.map(dest => dest.name).join(", "),
            totalDistance,
            totalDays
          } 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  const routeCoordinates = selectedDestinations.map(dest => ({
    lat: dest.coordinates[0],
    lng: dest.coordinates[1],
  }));

  return (
    <div className="tour-plan-page">
      {/* Breadcrumb */}
      <div className="path-handler-h">
        <span onClick={() => navigate('/')}>Plan Your Tour</span> &gt; Tour Plan
      </div>

      {/* Progress Steps - Added new component here */}
      <TourProgressSteps currentStep={1} />

      {/* Banner */}
      <BannerSection />

      {/* Tour Plan Section */}
      <div id="tour-plan-section" className="package-customizer">
        <h2>Customize Your Tour Package</h2>
        <Row gutter={24}>
          <Col span={12}>
            <Card title="Select Your Travel Dates" className="date-picker-card">
              <RangePicker
                onChange={(dates) => {
                  setDateRange(dates);
                  if (dates && dates[0] && dates[1]) {
                    const days = dates[1].diff(dates[0], 'day') + 1;
                    setTotalDays(days);
                  } else {
                    setTotalDays(null);
                  }
                }}
                style={{ width: '100%' }}
                disabledDate={disabledDate}
              />
            </Card>

            <Card title="Choose Your Destinations" className="destinations-card">
              {/* Search functionality */}
              <Search
                placeholder="Search for a destination"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ marginBottom: '15px' }}
              />

              <Select
                style={{ width: '100%' }}
                placeholder="Select destinations"
                onChange={handleDestinationSelect}
                options={filteredDestinations.map(dest => ({
                  value: dest.name,
                  label: dest.name,
                }))}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />

              <div className="selected-destinations">
                {selectedDestinations.map((dest) => (
                  <div key={dest.name} className="destination-tag">
                    {dest.name}
                    <button onClick={() => handleDestinationRemove(dest.name)}>×</button>
                  </div>
                ))}
              </div>

              {totalDistance && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <strong>Total Distance:</strong> {totalDistance} km
                </div>
              )}

              {totalDays && (
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                  <strong>Total Days:</strong> {totalDays} day{totalDays > 1 ? 's' : ''}
                </div>
              )}

              {error && (
                <div style={{ marginTop: '8px', textAlign: 'center', color: 'red' }}>
                  {error}
                </div>
              )}

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Button 
                  type="primary" 
                  onClick={handleContinue} 
                  loading={loading}
                  disabled={!dateRange || selectedDestinations.length === 0}
                >
                  Continue
                </Button>
              </div>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Your Tour Map" className="map-card">
              <div className="map-container">
                <MapContainer
                  center={SRI_LANKA_CENTER}
                  zoom={7}
                  style={{ height: '400px', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  {selectedDestinations.map((dest) => (
                    <Marker
                      key={dest.name}
                      position={dest.coordinates}
                      icon={pinIcon}
                    >
                      <Popup>{dest.name}</Popup>
                    </Marker>
                  ))}
                  {routeCoordinates.length > 1 && (
                    <RoutingMachine
                      waypoints={routeCoordinates.map(r => [r.lat, r.lng])}
                      onDistanceChange={setTotalDistance}
                    />
                  )}
                </MapContainer>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Trending Destinations */}
      <div className="trending-destinations-section">
        <h2>Trending destinations</h2>
        <p className="trending-subtitle">Most popular choices for travellers from Sri Lanka</p>

        <div className="trending-grid">
          <Row gutter={[16, 16]}>
            {trendingDestinations.slice(0, 2).map((dest) => (
              <Col xs={24} md={12} key={dest.name}>
                <div
                  className="trending-destination-card large"
                  onClick={() => handleTrendingDestinationClick(dest.name)}
                >
                  <div
                    className="trending-image"
                    style={{ backgroundImage: `url(${dest.image})` }}
                  >
                    <div className="destination-label">
                      {dest.name}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            {trendingDestinations.slice(2).map((dest) => (
              <Col xs={24} md={8} key={dest.name}>
                <div
                  className="trending-destination-card"
                  onClick={() => handleTrendingDestinationClick(dest.name)}
                >
                  <div
                    className="trending-image"
                    style={{ backgroundImage: `url(${dest.image})` }}
                  >
                    <div className="destination-label">
                      {dest.name}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
      <BookingFooter/>
    </div>
  );
};

export default TourPlan;