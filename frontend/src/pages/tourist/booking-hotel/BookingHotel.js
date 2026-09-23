import React, { useState, useEffect } from "react";
import "./BookingHotel.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BookingHotelCard from "./BookingHotelCard";

import BookingHotelForm from "./booking-hotel-form/BookingHotelForm";
import BannerSectionHotelBook from "./BannerSectionHotelBook";
import BookingFooter from "../booking-footer/BookingFooter";
import TourProgressSteps from "../tour-progress-steps/TourProgressSteps";
import { Typography, Box, Button, Container, Fade, Skeleton } from "@mui/material";
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  Sort as SortIcon, 
  Bed as BedIcon, 
  People as PeopleIcon, 
  AttachMoney as MoneyIcon,
  AcUnit as AcIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon
} from "@mui/icons-material";

function BookingHotel() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [hotelData, setHotelData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    beds: "",
    occupancy: "",
    location: ""
  });
  const [sortOption, setSortOption] = useState("default");
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);

  // Open & Close Handlers for booking form
  const handleClickOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    getAllHotelRoom();
  };

  // Extract locations from hotel names
  const extractLocations = (hotels) => {
    const locationSet = new Set();
    
    hotels.forEach(hotel => {
      // Try to extract location from hotel name
      // Assuming format like "Hotel Name - Location" or similar patterns
      const nameParts = hotel.name.split(/[-–—|,]/);
      if (nameParts.length > 1) {
        const possibleLocation = nameParts[nameParts.length - 1].trim();
        if (possibleLocation) {
          locationSet.add(possibleLocation);
        }
      }
    });
    
    return Array.from(locationSet).sort();
  };

  // Fetch all hotel rooms
  const getAllHotelRoom = () => {
    setLoading(true);
    axios
      .get("http://localhost:4000/api/hotelRoom")
      .then((response) => {
        console.log(response.data);
        setHotelData(response.data);
        setFilteredData(response.data);
        
        // Extract available locations from hotel names
        const extractedLocations = extractLocations(response.data);
        setLocations(extractedLocations);
        
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    getAllHotelRoom();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let results = [...hotelData];
    
    // Apply search
    if (searchQuery) {
      results = results.filter(hotel => 
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply location filter
    if (filters.location) {
      results = results.filter(hotel => 
        hotel.name.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Apply price filters
    if (filters.minPrice) {
      results = results.filter(hotel => hotel.price_day >= Number(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      results = results.filter(hotel => hotel.price_day <= Number(filters.maxPrice));
    }
    
    if (filters.beds) {
      results = results.filter(hotel => hotel.bed >= Number(filters.beds));
    }
    
    if (filters.occupancy) {
      results = results.filter(hotel => hotel.max_occupancy >= Number(filters.occupancy));
    }
    
    // Apply sorting
    if (sortOption === "price-low") {
      results.sort((a, b) => a.price_day - b.price_day);
    } else if (sortOption === "price-high") {
      results.sort((a, b) => b.price_day - a.price_day);
    } else if (sortOption === "occupancy") {
      results.sort((a, b) => b.max_occupancy - a.max_occupancy);
    }
    
    setFilteredData(results);
  }, [searchQuery, filters, sortOption, hotelData]);

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

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setFilters({
      minPrice: "",
      maxPrice: "",
      beds: "",
      occupancy: "",
      location: ""
    });
    setSortOption("default");
  };

  // Navigation handlers for tour booking flow
  const goBackToVehicles = () => {
    navigate('/Tourist/vehicle-book');
  };
  
  const proceedToGuides = () => {
    navigate('/Tourist/guide-book');
  };

  // Skeleton loader for hotel cards
  const HotelCardSkeleton = () => (
    <Box sx={{ 
      height: '280px',
      bgcolor: '#fff', 
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' }
    }}>
      <Skeleton 
        variant="rectangular" 
        width="40%" 
        height="100%" 
        animation="wave"
        sx={{ display: { xs: 'none', md: 'block' } }}
      />
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height="200px" 
        animation="wave"
        sx={{ display: { xs: 'block', md: 'none' } }}
      />
      <Box sx={{ width: { xs: '100%', md: '60%' }, p: 3 }}>
        <Skeleton variant="text" height={40} width="70%" animation="wave" />
        <Skeleton variant="text" height={20} width="100%" animation="wave" />
        <Skeleton variant="text" height={20} width="90%" animation="wave" />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Skeleton variant="rectangular" width={100} height={30} animation="wave" />
          <Skeleton variant="rectangular" width={100} height={30} animation="wave" />
        </Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="text" width={100} height={40} animation="wave" />
          <Skeleton variant="rectangular" width={120} height={40} animation="wave" />
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <BannerSectionHotelBook />
      
      {/* Tour Progress Steps - Set currentStep to 3 for "Select Hotels" */}
      <div className="tour-progress-container">
        <TourProgressSteps currentStep={3} />
      </div>
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <div className="breadcrumb-h">
          <span onClick={() => navigate('/')} className="breadcrumb-link">Plan Your Tour</span> &gt; 
          <span className="breadcrumb-link" onClick={goBackToVehicles}>Select Vehicle</span> &gt;
          <span className="current"> Hotel Booking</span>
        </div>
        
        <div className="hotel-booking-page">
          <Fade in={true} timeout={800}>
            <div className="hotel-booking-header">
              <h1 className="booking-main-title">Book Your Hotel</h1>
              <p className="booking-subtitle">Find the perfect room for your stay</p>
              
              {/* Search and filter controls */}
              <div className="hotel-search-controls">
                <div className="search-bar">
                  <SearchIcon className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search by hotel name or description..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Location Filter Dropdown */}
                <div className="location-filter">
                  <LocationIcon className="location-icon" />
                  <select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="location-select"
                  >
                    <option value="">All Locations</option>
                    {locations.map((location, index) => (
                      <option key={index} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                
                <div className="control-buttons">
                  <button className="filter-button" onClick={toggleFilters}>
                    <FilterIcon fontSize="small" />
                    {showFilters ? "Hide Filters" : "Filters"}
                  </button>
                  
                  <select 
                    className="sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="default">Sort by</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="occupancy">Highest Occupancy</option>
                  </select>
                </div>
              </div>
              
              {/* Advanced filter panel */}
              {showFilters && (
                <Fade in={showFilters} timeout={400}>
                  <div className="advanced-filter-panel">
                    <div className="filter-group">
                      <label><MoneyIcon fontSize="small" /> Price Range</label>
                      <div className="price-range">
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
                      <label><BedIcon fontSize="small" /> Minimum Beds</label>
                      <select 
                        name="beds" 
                        value={filters.beds}
                        onChange={handleFilterChange}
                      >
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                      </select>
                    </div>
                    
                    <div className="filter-group">
                      <label><PeopleIcon fontSize="small" /> Minimum Occupancy</label>
                      <select 
                        name="occupancy" 
                        value={filters.occupancy}
                        onChange={handleFilterChange}
                      >
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                      </select>
                    </div>
                    
                    <div className="filter-group">
                      <label><AcIcon fontSize="small" /> Room Features</label>
                      <select>
                        <option value="">Any Type</option>
                        <option value="ac">AC Rooms</option>
                        <option value="nonac">Non-AC Rooms</option>
                      </select>
                    </div>
                    
                    <button className="clear-filters" onClick={clearFilters}>
                      <RefreshIcon fontSize="small" /> Clear All
                    </button>
                  </div>
                </Fade>
              )}
            </div>
          </Fade>
          
          {/* Results count */}
          <div className="results-count">
            {loading ? 
              "Loading hotel rooms..." : 
              `Showing ${filteredData.length} of ${hotelData.length} hotel rooms`
            }
          </div>
          
          {/* Hotel rooms grid */}
          <div className="hotel-rooms-grid">
            {loading ? (
              // Show skeletons while loading
              Array(3).fill().map((_, index) => (
                <HotelCardSkeleton key={index} />
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map((hotel) => (
                <BookingHotelCard 
                  key={hotel.HR_Id} 
                  hotel={hotel} 
                  getAllHotelRoom={getAllHotelRoom}
                />
              ))
            ) : (
              <div className="no-results">
                <h3>No rooms match your search</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="reset-search" onClick={clearFilters}>Reset Search</button>
              </div>
            )}
          </div>
          
          {/* Navigation buttons for booking flow */}
          <div className="booking-navigation-buttons">
            <button className="back-button" onClick={goBackToVehicles}>
              &larr; Back to Vehicles
            </button>
            <button className="next-button" onClick={proceedToGuides}>
              Continue to Guides &rarr;
            </button>
          </div>
          
          <BookingFooter/>
        </div>
      </Container>
      
      {/* Global booking form */}
      <BookingHotelForm 
        open={open} 
        handleClose={handleClose} 
        getAllBooking={getAllHotelRoom}
      />
    </>
  );
}

export default BookingHotel;