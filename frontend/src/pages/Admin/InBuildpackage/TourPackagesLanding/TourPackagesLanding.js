import React, { useState } from 'react';
import './TourPackagesLanding.css';
import { Map, Calendar, User, DollarSign, Search, ArrowRight, X, Info } from 'lucide-react';

const TourPackagesLanding = () => {
  // Sample data from your admin component
  const tourPackages = [
    {
      tp_Id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      packageId: "ADV-001",
      Packagename: "Himalayan Trek Adventure",
      destination: "Nepal - Everest Base Camp",
      price: 2499,
      startDate: "2025-06-10T00:00:00.000Z",
      endDate: "2025-06-21T00:00:00.000Z",
      tourGuideName: "Sherpa Tenzing",
      tourType: "Adventure",
      description: "Experience the thrill of trekking to Everest Base Camp with our expert guides. This 12-day adventure will take you through stunning Himalayan landscapes, traditional Sherpa villages, and ultimately to the base of the world's highest mountain. Suitable for experienced hikers looking for the journey of a lifetime.",
      imageUrl: "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?q=80&w=1000&auto=format&fit=crop",
    },
    {
      tp_Id: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
      packageId: "BCH-002",
      Packagename: "Bali Beach Paradise",
      destination: "Indonesia - Bali",
      price: 1899,
      startDate: "2025-05-15T00:00:00.000Z",
      endDate: "2025-05-22T00:00:00.000Z",
      tourGuideName: "Maya Indra",
      tourType: "Beach",
      description: "Escape to the tropical paradise of Bali with our 8-day beach getaway. Enjoy pristine beaches, luxurious accommodations, and authentic Indonesian cuisine. Package includes guided tours to ancient temples, traditional dance performances, and a sunset dinner cruise.",
      imageUrl: "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?q=80&w=1000&auto=format&fit=crop",
    },
    {
      tp_Id: "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b",
      packageId: "CLT-003",
      Packagename: "Japanese Cultural Experience",
      destination: "Japan - Kyoto and Tokyo",
      price: 3299,
      startDate: "2025-04-03T00:00:00.000Z",
      endDate: "2025-04-12T00:00:00.000Z",
      tourGuideName: "Hiroshi Tanaka",
      tourType: "Cultural",
      description: "Immerse yourself in Japanese culture with our 10-day tour of Kyoto and Tokyo. Visit ancient temples, participate in a traditional tea ceremony, and experience both the historic and modern sides of Japan. Highlights include cherry blossom viewing (seasonal), a night in a traditional ryokan, and a sushi-making class.",
      imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1000&auto=format&fit=crop",
    },
    {
      tp_Id: "7fb1377b-57ef-4885-a3e6-5b821e16898c",
      packageId: "FAM-004",
      Packagename: "Orlando Family Fun",
      destination: "USA - Orlando, Florida",
      price: 2799,
      startDate: "2025-07-10T00:00:00.000Z",
      endDate: "2025-07-17T00:00:00.000Z",
      tourGuideName: "Jessica Rodriguez",
      tourType: "Family",
      description: "Create unforgettable memories with our family-friendly Orlando package. Enjoy 7 days of fun with passes to major theme parks, comfortable family accommodations, and transportation included. Perfect for families with children of all ages, this package makes navigating Orlando's attractions easy and stress-free.",
      imageUrl: "https://images.unsplash.com/photo-1575089976121-8ed7b2a54265?q=80&w=1000&auto=format&fit=crop",
    },
    {
      tp_Id: "9e71dc35-d70d-4a31-b76a-cd2d10df127a",
      packageId: "LUX-005",
      Packagename: "Maldives Luxury Escape",
      destination: "Maldives - Private Island Resort",
      price: 5999,
      startDate: "2025-03-12T00:00:00.000Z",
      endDate: "2025-03-19T00:00:00.000Z",
      tourGuideName: "Ahmed Rasheed",
      tourType: "Luxury",
      description: "Indulge in the ultimate luxury experience with our exclusive Maldives package. Stay in an overwater bungalow with direct access to crystal clear waters. Package includes gourmet dining, couples spa treatments, private snorkeling tours, and sunset champagne cruises. Perfect for honeymoons or special celebrations.",
      imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1000&auto=format&fit=crop",
    },
    {
      tp_Id: "3b96c09e-2edc-4c1a-85cc-af56568cdef2",
      packageId: "WLD-006",
      Packagename: "African Safari Adventure",
      destination: "Kenya - Masai Mara",
      price: 4199,
      startDate: "2025-08-05T00:00:00.000Z",
      endDate: "2025-08-14T00:00:00.000Z",
      tourGuideName: "Daniel Kimani",
      tourType: "Wildlife",
      description: "Experience the majestic wildlife of Africa with our 10-day safari in Kenya's Masai Mara. Witness the Great Migration, see the Big Five up close, and connect with local Masai communities. Accommodations include luxury tented camps with amazing views. Daily game drives and expert naturalist guides ensure an unforgettable wildlife adventure.",
      imageUrl: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?q=80&w=1000&auto=format&fit=crop",
    }
  ];

  const [activeFilters, setActiveFilters] = useState({
    tourType: 'All',
    priceRange: 'All'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewPackage, setViewPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filterOptions = {
    tourTypes: ['All', 'Adventure', 'Beach', 'Cultural', 'Family', 'Luxury', 'Wildlife'],
    priceRanges: [
      { label: 'All', min: 0, max: Infinity },
      { label: 'Under $2,000', min: 0, max: 2000 },
      { label: '$2,000 - $3,000', min: 2000, max: 3000 },
      { label: '$3,000 - $5,000', min: 3000, max: 5000 },
      { label: 'Over $5,000', min: 5000, max: Infinity }
    ]
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDetails = (pkg) => {
    setViewPackage(pkg);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setViewPackage(null);
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters({
      ...activeFilters,
      [filterType]: value
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredPackages = tourPackages.filter(pkg => {
    // Filter by tour type
    const typeMatch = activeFilters.tourType === 'All' || pkg.tourType === activeFilters.tourType;
    
    // Filter by price range
    const selectedPriceRange = filterOptions.priceRanges.find(range => range.label === activeFilters.priceRange);
    const priceMatch = pkg.price >= selectedPriceRange.min && pkg.price <= selectedPriceRange.max;
    
    // Filter by search query
    const searchMatch = searchQuery === '' || 
      pkg.Packagename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return typeMatch && priceMatch && searchMatch;
  });

  return (
    <div className="travel-landing-container">
      

      <section className="tours-section">
        <div className="section-header">
          <h2>Featured Tour Packages</h2>
          <p>Find your perfect getaway from our selection of carefully crafted experiences</p>
        </div>

        <div className="filter-container">
          <div className="filter-group">
            <label>Tour Type:</label>
            <select 
              value={activeFilters.tourType} 
              onChange={(e) => handleFilterChange('tourType', e.target.value)}
            >
              {filterOptions.tourTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range:</label>
            <select 
              value={activeFilters.priceRange} 
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            >
              {filterOptions.priceRanges.map(range => (
                <option key={range.label} value={range.label}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="tour-packages-grid">
          {filteredPackages.length === 0 ? (
            <p className="no-packages">No tour packages match your criteria. Try adjusting your filters.</p>
          ) : (
            filteredPackages.map(pkg => (
              <div className="tour-package-card" key={pkg.tp_Id}>
                <div className="card-image">
                  <img src={pkg.imageUrl} alt={pkg.Packagename} />
                  <div className="tour-type">{pkg.tourType}</div>
                  <div className="price-tag">${pkg.price.toLocaleString()}</div>
                </div>
                
                <div className="card-content">
                  <h3>{pkg.Packagename}</h3>
                  <p className="destination">
                    <Map size={16} color="black" className="icon-margin" /> {pkg.destination}
                  </p>
                  <p className="duration">
                    <Calendar size={16} color="black" className="icon-margin" /> {calculateDuration(pkg.startDate, pkg.endDate)} days
                    <span className="dates"> ({formatDate(pkg.startDate)})</span>
                  </p>
                  
                  <p className="description-preview">
                    {pkg.description.substring(0, 100)}...
                  </p>
                  
                  <div className="card-actions">
                    <button 
                      className="details-btn" 
                      onClick={() => handleViewDetails(pkg)}
                    >
                      <Info size={16} color="black" className="icon-margin" /> View Details
                    </button>
                    <button className="book-now-btn">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {showModal && viewPackage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={closeModal}>
              <X size={20} color="black" />
            </span>
            
            <div className="package-modal">
              <div className="modal-image">
                <img src={viewPackage.imageUrl} alt={viewPackage.Packagename} />
                <div className={`tour-type-badge ${viewPackage.tourType.toLowerCase()}`}>
                  {viewPackage.tourType}
                </div>
              </div>
              
              <div className="modal-details">
                <h2>{viewPackage.Packagename}</h2>
                <div className="package-highlights">
                  <div className="highlight">
                    <Map size={18} color="black" className="highlight-icon" />
                    <span>{viewPackage.destination}</span>
                  </div>
                  <div className="highlight">
                    <Calendar size={18} color="black" className="highlight-icon" />
                    <span>{calculateDuration(viewPackage.startDate, viewPackage.endDate)} days</span>
                  </div>
                  <div className="highlight">
                    <User size={18} color="black" className="highlight-icon" />
                    <span>Guide: {viewPackage.tourGuideName}</span>
                  </div>
                  <div className="highlight price">
                    <DollarSign size={18} color="black" className="highlight-icon" />
                    <span>${viewPackage.price.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="dates-container">
                  <div className="date-item">
                    <span className="date-label">Start:</span>
                    <span className="date-value">{formatDate(viewPackage.startDate)}</span>
                  </div>
                  <div className="date-separator">
                    <ArrowRight size={16} color="black" />
                  </div>
                  <div className="date-item">
                    <span className="date-label">End:</span>
                    <span className="date-value">{formatDate(viewPackage.endDate)}</span>
                  </div>
                </div>
                
                <div className="description-container">
                  <h3>Tour Description</h3>
                  <p>{viewPackage.description}</p>
                </div>
                
                <div className="package-actions">
                  <button className="inquire-btn">
                    <Info size={16} color="black" className="icon-margin" /> Inquire Now
                  </button>
                  <button className="book-btn">
                    Book This Tour
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourPackagesLanding;