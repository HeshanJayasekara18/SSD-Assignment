import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./BookingVehicle.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BookingFooter from "../booking-footer/BookingFooter";
import BookingVehicleForm from "./BookingVehicleForm";
import TourProgressSteps from "../tour-progress-steps/TourProgressSteps"; // Import the TourProgressSteps component
import { 
  faUserGroup, 
  faGasPump, 
  faCarSide, 
  faCogs,
  faSearch,
  faFilter,
  faArrowDown,
  faArrowUp,
  faArrowLeft,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import BannerSectionvehicle from "./BannerSectionvehicle";
import { useLocation } from 'react-router-dom';
function BookingVehicle() {

  const location = useLocation();
  const { tourID, startDate, endDate, destinations, totalDistance, totalDays } = location.state || {};

  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    seats: "",
    fuelType: "",
    transmission: ""
  });
  const [sortBy, setSortBy] = useState("priceAsc");
  
  // Add new state variables for the form
  const [openBookingForm, setOpenBookingForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Business ID state
  const [businessId, setBusinessId] = useState(null);

  // Track if a vehicle has been selected for navigation purposes
  const [vehicleSelected, setVehicleSelected] = useState(false);

  // Fetch business ID and vehicles
  useEffect(() => {
    const fetchBusinessAndVehicles = async () => {
      try {
        // Option 2: Hardcode for testing (replace this with actual logic)
        setBusinessId("business-123");
        
        // Fetch vehicles
        const vehiclesResponse = await axios.get("http://localhost:4000/api/vehicle");
        setVehicles(vehiclesResponse.data);
        setFilteredVehicles(vehiclesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchBusinessAndVehicles();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let results = [...vehicles];
    
    // Apply search
    if (searchQuery) {
      results = results.filter(vehicle => 
        vehicle.modelName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply filters
    if (filters.minPrice) {
      results = results.filter(vehicle => vehicle.priceDay >= Number(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      results = results.filter(vehicle => vehicle.priceDay <= Number(filters.maxPrice));
    }
    
    if (filters.seats) {
      results = results.filter(vehicle => vehicle.seats >= Number(filters.seats));
    }
    
    if (filters.fuelType) {
      results = results.filter(vehicle => 
        vehicle.fuelType.toLowerCase() === filters.fuelType.toLowerCase()
      );
    }
    
    if (filters.transmission) {
      results = results.filter(vehicle => 
        vehicle.transmission.toLowerCase() === filters.transmission.toLowerCase()
      );
    }
    
    // Apply sorting
    if (sortBy === "priceAsc") {
      results.sort((a, b) => a.priceDay - b.priceDay);
    } else if (sortBy === "priceDesc") {
      results.sort((a, b) => b.priceDay - a.priceDay);
    } else if (sortBy === "seats") {
      results.sort((a, b) => b.seats - a.seats);
    }
    
    setFilteredVehicles(results);
  }, [searchQuery, filters, sortBy, vehicles]);

  // Get unique options for dropdown filters
  const fuelTypes = [...new Set(vehicles.map(v => v.fuelType))];
  const transmissionTypes = [...new Set(vehicles.map(v => v.transmission))];

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Add function to handle opening the booking form
  const handleOpenBookingForm = (vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenBookingForm(true);
    setVehicleSelected(true); // Mark that a vehicle has been selected
  };
  
  // Add function to handle closing the booking form
  const handleCloseBookingForm = () => {
    setOpenBookingForm(false);
  };
  
  // Add function to refresh bookings (if needed)
  const getAllBooking = () => {
    // You can implement this if you need to refresh a booking list
    console.log("Booking successful - refreshing bookings if needed");
  };
  
  // Handle previous step navigation
  const handlePreviousStep = () => {
    navigate('/Tourist/Tourist');
  };
  
  // Handle next step navigation
  const handleNextStep = () => {
    // Optionally, you can check if a vehicle has been selected before proceeding
    if (!vehicleSelected && !selectedVehicle) {
      alert("Please select a vehicle before proceeding to the next step.");
      return;
    }
    
    // Navigate to the next step
    navigate('/Tourist/hotel-book');
  };

  return (
    <div className="booking-vehicle-page">
      <BannerSectionvehicle />
      
      {/* Add the TourProgressSteps component here with the current step */}
      <TourProgressSteps currentStep={2} />
      
      <div className="booking-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={() => navigate('/Tourist/Tourist')} className="breadcrumb-link">Plan Your Tour</span> &gt; 
          <span className="current"> Vehicle Booking</span>
        </div>
        
        <h1 className="page-title">Book Your Tour Vehicle</h1>
        
        {/* Search and filter bar */}
        <div className="search-filter-container">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search vehicles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-sort-buttons">
            <button className="filter-button" onClick={toggleFilters}>
              <FontAwesomeIcon icon={faFilter} /> Filters
            </button>
            
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="seats">Seats: Most</option>
            </select>
          </div>
        </div>
        
        {/* Advanced filters */}
        {showFilters && (
          <div className="advanced-filters">
            <div className="filter-group">
              <label>Price Range:</label>
              <div className="price-inputs">
                <input 
                  type="number" 
                  placeholder="Min $" 
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                />
                <span>to</span>
                <input 
                  type="number" 
                  placeholder="Max $" 
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Min Seats:</label>
              <select 
                name="seats" 
                value={filters.seats}
                onChange={handleFilterChange}
              >
                <option value="">Any</option>
                <option value="2">2+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
                <option value="7">7+</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Fuel Type:</label>
              <select 
                name="fuelType" 
                value={filters.fuelType}
                onChange={handleFilterChange}
              >
                <option value="">Any</option>
                {fuelTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Transmission:</label>
              <select 
                name="transmission" 
                value={filters.transmission}
                onChange={handleFilterChange}
              >
                <option value="">Any</option>
                {transmissionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="clear-filters"
              onClick={() => setFilters({
                minPrice: "",
                maxPrice: "",
                seats: "",
                fuelType: "",
                transmission: ""
              })}
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {/* Results count */}
        <div className="results-info">
          Showing {filteredVehicles.length} of {vehicles.length} vehicles
        </div>
        
        {/* Vehicles Grid */}
        <div className="vehicles-grid">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <div className="vehicle-card" key={vehicle.V_Id}>
                <div className="vehicle-image-container">
                  <img
                    src={vehicle.image || "https://via.placeholder.com/250x180?text=Vehicle"}
                    alt={vehicle.modelName}
                    className="vehicle-image"
                  />
                  <div className="vehicle-tag">Available Now</div>
                </div>
                
                <div className="vehicle-content">
                  <div className="vehicle-header">
                    <h3 className="vehicle-name">{vehicle.modelName}</h3>
                    <div className="vehicle-rating">
                      <span className="stars">⭐⭐⭐⭐☆</span>
                      <span className="review-count">(24)</span>
                    </div>
                  </div>
                  
                  <div className="vehicle-features">
                    <div className="feature">
                      <FontAwesomeIcon icon={faUserGroup} />
                      <span>{vehicle.seats} Seats</span>
                    </div>
                    <div className="feature">
                      <FontAwesomeIcon icon={faGasPump} />
                      <span>{vehicle.fuelType}</span>
                      </div>
                    <div className="feature">
                      <FontAwesomeIcon icon={faCarSide} />
                      <span>{vehicle.doors} Doors</span>
                    </div>
                    <div className="feature">
                      <FontAwesomeIcon icon={faCogs} />
                      <span>{vehicle.transmission}</span>
                    </div>
                  </div>
                  
                  <div className="vehicle-footer">
                    <div className="price">
                      <span className="amount">${vehicle.priceDay}</span>
                      <span className="period">/ day</span>
                    </div>
                    {/* Update the Book Now button to open the form instead of navigating */}
                    <button className="book-button" onClick={() => handleOpenBookingForm(vehicle)}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <h3>No vehicles match your criteria</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
        
        {/* Navigation buttons */}
        <div className="navigation-buttons">
          <button onClick={handlePreviousStep} className="nav-button prev-button">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Plan
          </button>
          <button onClick={handleNextStep} className="nav-button next-button">
            Continue to Hotels <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
      
      {/* Pass the businessId to the BookingVehicleForm component */}
      <BookingVehicleForm 
        open={openBookingForm}
        handleClose={handleCloseBookingForm}
        getAllBooking={getAllBooking}
        selectedVehicle={selectedVehicle}
        businessId={businessId} // Pass the business ID here
        tourID={tourID} // Pass the tour ID here
      />
      
      <BookingFooter />
    </div>
  );
}

export default BookingVehicle;