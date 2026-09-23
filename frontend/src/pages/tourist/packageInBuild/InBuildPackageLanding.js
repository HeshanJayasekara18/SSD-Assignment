import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Payment from '../../Admin/InBuildpackage/paymentpage/PackagePayment';
// Import Dialog components from Material UI
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
// Import icons from react-icons
import { FaMapMarkerAlt, FaClock, FaUser, FaArrowLeft, FaSearch, FaEnvelope } from 'react-icons/fa';
import { MdDateRange, MdLocationOn } from 'react-icons/md';
import { AiFillStar, AiFillHeart } from 'react-icons/ai';
import { BiSolidCategory } from 'react-icons/bi';
import BookingFooter from "../booking-footer/BookingFooter";
import { Star, ChevronLeft, ChevronRight, User } from 'lucide-react';

import './InBuildPackageLanding.css'; // Import your CSS file

const TourPackagesLanding = () => {
  const [tourPackages, setTourPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewPackage, setViewPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  // Add state for dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Feedback section states
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);
  const [feedbackError, setFeedbackError] = useState(null);
  const [filteredCategory, setFilteredCategory] = useState('All');
  
  // Initialize useNavigate hook
  const navigate = useNavigate();

  // Handle opening the dialog
  const handleClickOpen = (pkgId = null) => {
    if (pkgId) {
      const packageToEdit = tourPackages.find(pkg => pkg.tp_Id === pkgId);
      setSelectedPackageId(pkgId);
      setViewPackage(packageToEdit);
    } else if (viewPackage) {
      setSelectedPackageId(viewPackage.tp_Id);
    } else {
      setSelectedPackageId(null);
      setViewPackage(null);
    }
    setIsDialogOpen(true);
  };

  // Handle closing the dialog
  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedPackageId(null);
  };

  // Fetch tour packages from the API
  useEffect(() => {
    const fetchTourPackages = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/tourPackage');
        setTourPackages(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching tour packages:', error);
        setError('Failed to load tour packages. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchTourPackages();
    
    // Check local storage for favorites
    const storedFavorites = localStorage.getItem('tourFavorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Fetch feedback data
  useEffect(() => {
    const fetchFeedbacks = async () => {
      setIsLoadingFeedback(true);
      try {
        const response = await axios.get('http://localhost:4000/api/feedback');
        if (response.data && response.data.feedbacks) {
          setFeedbacks(response.data.feedbacks);
        } else {
          throw new Error('Invalid feedback data format');
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setFeedbackError(err.message || 'Failed to fetch feedback data');
      } finally {
        setIsLoadingFeedback(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const handleView = (pkg) => {
    setViewPackage(pkg);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
  };

  const closePackageView = () => {
    setViewPackage(null);
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
  
  const toggleFavorite = (pkgId) => {
    setFavorites(prev => {
      let newFavorites;
      if (prev.includes(pkgId)) {
        newFavorites = prev.filter(id => id !== pkgId);
      } else {
        newFavorites = [...prev, pkgId];
      }
      
      // Store in localStorage
      localStorage.setItem('tourFavorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Get all unique tour types
  const allTourTypes = ['All', ...new Set(tourPackages.map(pkg => pkg.tourType))];

  // Filter packages based on search and active category
  const filteredPackages = tourPackages
    .filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pkg.destination.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'All' || pkg.tourType === activeCategory;
      
      return matchesSearch && matchesCategory;
    });

  // Filter feedbacks by category
  const filteredFeedbacks = filteredCategory === 'All' 
    ? feedbacks 
    : feedbacks.filter(feedback => feedback.serviceType === filteredCategory);

  // Feedback navigation handlers
  const goToPrevious = () => {
    setCurrentIndex(prev => 
      prev === 0 ? filteredFeedbacks.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prev => 
      prev === filteredFeedbacks.length - 1 ? 0 : prev + 1
    );
  };

  // Render star rating
  const renderStarRating = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i}
        size={18}
        className={`star-icon-j ${i < rating ? 'filled-j' : 'empty-j'}`}
        fill={i < rating ? '#FFD700' : 'none'}
        stroke={i < rating ? '#FFD700' : '#D1D5DB'}
      />
    ));
  };

  // Get the service type name
  const getServiceTypeName = (type) => {
    const types = {
      'TourGuide': 'Tour Guide',
      'HotelRoom': 'Hotel Room',
      'Vehicle': 'Vehicle'
    };
    return types[type] || type;
  };

  return (
    <div className="tour-landing-container-j">
      {/* Hero Section */}
      <div className="hero-section-j">
        <div className="hero-overlay-j"></div>
        <div className="hero-content-j">
          <h1>Discover Amazing Tours</h1>
          <p>Find your perfect adventure from our selection of premium tour packages</p>
          <div className={`search-container-j ${isSearchFocused ? 'search-focused' : ''}`}>
            <div className="search-input-wrapper-j">
              <FaSearch className="search-icon-j" />
              <input
                type="text"
                placeholder="Search destinations, tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
            <button className="search-btn-j">
              <span>Search</span>
              <span className="search-btn-hover">Explore Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Single Package View */}
      {viewPackage && (
        <div className="package-detail-section-j">
          <button className="back-button-j" onClick={closePackageView}>
            <FaArrowLeft className="back-icon-j" /> <span>Back to All Packages</span>
          </button>
          
          <div className="package-detail-container-j">
            <div className="package-detail-header-j">
              <h2>{viewPackage.name}</h2>
              <div className="package-header-actions-j">
                <span className="package-tag-j">{viewPackage.tourType}</span>
                <button 
                  className={`favorite-btn-j ${favorites.includes(viewPackage.tp_Id) ? 'is-favorite' : ''}`}
                  onClick={() => toggleFavorite(viewPackage.tp_Id)}
                  aria-label={favorites.includes(viewPackage.tp_Id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <AiFillHeart />
                </button>
              </div>
            </div>
            
            <div className="package-detail-main-j">
              <div className="package-detail-image-j">
                <img src={viewPackage.image} alt={viewPackage.name} />
                <div className="image-overlay-j"></div>
              </div>
              
              <div className="package-detail-info-j">
                <div className="package-highlight-j">
                  <div className="highlight-item-j">
                    <span className="highlight-label-j">Price</span>
                    <span className="highlight-value-j">${viewPackage.price.toLocaleString()}</span>
                  </div>
                  <div className="highlight-item-j">
                    <span className="highlight-label-j">Duration</span>
                    <span className="highlight-value-j">
                      {calculateDuration(viewPackage.startDate, viewPackage.endDate)} days
                    </span>
                  </div>
                  <div className="highlight-item-j">
                    <span className="highlight-label-j">Location</span>
                    <span className="highlight-value-j">{viewPackage.destination}</span>
                  </div>
                </div>
                
                <div className="package-dates-j">
                  <p><MdDateRange className="date-icon-j" /> <strong>Start:</strong> {formatDate(viewPackage.startDate)}</p>
                  <p><MdDateRange className="date-icon-j" /> <strong>End:</strong> {formatDate(viewPackage.endDate)}</p>
                </div>
                
                <h3>Tour Description</h3>
                <p className="package-description-j">{viewPackage.description}</p>
                
                <div className="package-guide-j">
                  <h3><FaUser className="guide-icon-j" /> Tour Guide</h3>
                  <p>{viewPackage.tourGuideName}</p>
                </div>
                
                <button className="book-now-btn-j" onClick={() => handleClickOpen()}>
                  <span className="btn-text-j">Book This Tour</span>
                  <span className="btn-icon-j">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Packages Section */}
      {!viewPackage && (
        <div className="section-container-j">
          <div className="packages-section-j">
            <div className="packages-grid-j">
              <div className="packages-header-j">
                <h2>Our Tour Packages</h2>
                <div className="tour-categories-j">
                  {allTourTypes.map(type => (
                    <button 
                      key={type}
                      className={`category-btn-j ${activeCategory === type ? 'active' : ''}`}
                      onClick={() => setActiveCategory(type)}
                    >
                      {type}
                      {activeCategory === type && <span className="active-indicator"></span>}
                    </button>
                  ))}
                </div>
              </div>
              
              {isLoading ? (
                <div className="loading-spinner-j">
                  <div className="spinner"></div>
                  <p>Loading amazing adventures...</p>
                </div>
              ) : error ? (
                <div className="error-message-j">
                  <p>{error}</p>
                  <button className="retry-btn-j" onClick={() => window.location.reload()}>Try Again</button>
                </div>
              ) : filteredPackages.length === 0 ? (
                <div className="no-results-j">
                  <p>No packages match your search criteria.</p>
                  <button className="reset-search-btn-j" onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('All');
                  }}>Reset Search</button>
                </div>
              ) : (
                <div className="packages-cards-j">
                  {filteredPackages.map(pkg => (
                    <div className="package-card-j" key={pkg.tp_Id}>
                      <div className="package-image-j">
                        <img src={pkg.image} alt={pkg.name} />
                        <div className="card-overlay-j"></div>
                        <div className="package-type-j">
                          <BiSolidCategory className="type-icon-j" /> {pkg.tourType}
                        </div>
                        <div className="package-price-j">${pkg.price.toLocaleString()}</div>
                        <button 
                          className={`card-favorite-btn-j ${favorites.includes(pkg.tp_Id) ? 'is-favorite' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(pkg.tp_Id);
                          }}
                          aria-label={favorites.includes(pkg.tp_Id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <AiFillHeart />
                        </button>
                      </div>
                      
                      <div className="package-content-j">
                        <h3>{pkg.name}</h3>
                        <div className="package-meta-j">
                          <span><FaMapMarkerAlt className="location-icon-j" /> {pkg.destination}</span>
                          <span><FaClock className="duration-icon-j" /> {calculateDuration(pkg.startDate, pkg.endDate)} days</span>
                        </div>
                        <p className="package-snippet-j">
                          {pkg.description.substring(0, 100)}...
                        </p>
                        <button 
                          className="view-details-btn-j"
                          onClick={() => handleView(pkg)}
                        >
                          <span>View Details</span>
                          <i className="btn-arrow">→</i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Featured Destinations Section */}
          <div className="featured-section-j">
            <h2>Featured Destinations</h2>
            <div className="destinations-grid-j">
              {tourPackages.slice(0, 3).map(pkg => (
                <div className="destination-card-j" key={`featured-${pkg.tp_Id}`}>
                  <img src={pkg.image} alt={pkg.destination} />
                  <div className="destination-overlay-j">
                    <h3><MdLocationOn className="dest-icon-j" /> {pkg.destination}</h3>
                    <button 
                      className="explore-btn-j"
                      onClick={() => handleView(pkg)}
                    >
                      <span>Explore</span>
                      <i className="explore-icon">→</i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Testimonials Section - REPLACED WITH FEEDBACK COMPONENT */}
          <section className="feedback-section-j bg-gradient-to-b-j from-white-j to-blue-50-j py-16-j">
            <div className="container-j mx-auto-j px-4-j">
              <div className="text-center-j mb-12-j">
                <h2 className="text-3xl-j font-bold-j text-gray-900-j mb-2-j">What Our Users Say</h2>
                <p className="text-lg-j text-gray-600-j max-w-2xl-j mx-auto-j">
                  Real experiences from travelers who have used our services
                </p>
                
                {/* Category Filter */}
                <div className="category-filter-j mt-8-j flex-j justify-center-j gap-3-j">
                  {['All', 'TourGuide', 'HotelRoom', 'Vehicle'].map(category => (
                    <button
                      key={category}
                      className={`px-4-j py-2-j rounded-full-j text-sm-j font-medium-j transition-colors-j 
                        ${filteredCategory === category 
                          ? 'bg-blue-600-j text-white-j' 
                          : 'bg-gray-100-j text-gray-700-j hover:bg-gray-200-j'}`}
                      onClick={() => {
                        setFilteredCategory(category);
                        setCurrentIndex(0);
                      }}
                    >
                      {category === 'All' ? 'All Services' : getServiceTypeName(category)}
                    </button>
                  ))}
                </div>
              </div>

              {isLoadingFeedback ? (
                <div className="feedback-loading-j text-center-j">Loading testimonials...</div>
              ) : feedbackError ? (
                <div className="feedback-error-j text-center-j">Unable to load testimonials at this time.</div>
              ) : filteredFeedbacks.length > 0 ? (
                <div className="feedback-carousel-j relative-j max-w-4xl-j mx-auto-j">
                  <div className="feedback-card-j bg-white-j rounded-lg-j shadow-lg-j p-8-j mb-6-j">
                    {filteredFeedbacks[currentIndex] && (
                      <>
                        <div className="flex-j items-center-j gap-3-j mb-4-j">
                          <div className="avatar-j bg-blue-100-j text-blue-600-j rounded-full-j p-2-j">
                            <User size={24} />
                          </div>
                          <div>
                            <h4 className="font-semibold-j text-gray-900-j">
                              {filteredFeedbacks[currentIndex].touristID?.name || 'Anonymous User'}
                            </h4>
                            <div className="text-sm-j text-gray-500-j">
                              {formatDate(filteredFeedbacks[currentIndex].date)}
                            </div>
                          </div>
                          <div className="ml-auto-j">
                            <span className="service-badge-j px-3-j py-1-j rounded-full-j text-xs-j font-semibold-j bg-blue-100-j text-blue-800-j">
                              {getServiceTypeName(filteredFeedbacks[currentIndex].serviceType)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="rating-j flex-j mb-4-j">
                          {renderStarRating(filteredFeedbacks[currentIndex].rating)}
                        </div>
                        
                        <blockquote className="text-gray-700-j text-lg-j italic-j mb-4-j">
                          "{filteredFeedbacks[currentIndex].comment || 'Great experience overall!'}"
                        </blockquote>
                      </>
                    )}
                  </div>
                  
                  {/* Navigation */}
                  <div className="carousel-controls-j flex-j justify-between-j">
                    <button 
                      onClick={goToPrevious}
                      className="navigation-button-j bg-white-j rounded-full-j shadow-md-j p-2-j hover:bg-gray-50-j transition-colors-j"
                      aria-label="Previous testimonial"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    
                    <div className="feedback-indicators-j flex-j gap-2-j items-center-j">
                      {filteredFeedbacks.map((_, index) => (
                        <button
                          key={index}
                          className={`indicator-dot-j h-2-j w-2-j rounded-full-j transition-all-j 
                            ${currentIndex === index ? 'bg-blue-600-j w-4-j' : 'bg-gray-300-j'}`}
                          onClick={() => setCurrentIndex(index)}
                          aria-label={`Go to testimonial ${index + 1}`}
                        />
                      ))}
                    </div>
                    
                    <button 
                      onClick={goToNext}
                      className="navigation-button-j bg-white-j rounded-full-j shadow-md-j p-2-j hover:bg-gray-50-j transition-colors-j"
                      aria-label="Next testimonial"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center-j text-gray-500-j">
                  No testimonials available for this category yet.
                </div>
              )}
              
              {/* Summary stats */}
              <div className="feedback-stats-j mt-16-j grid-j grid-cols-1-j md:grid-cols-3-j gap-8-j max-w-4xl-j mx-auto-j text-center-j">
                <div className="stat-card-j bg-white-j rounded-lg-j shadow-j p-6-j">
                  <div className="text-4xl-j font-bold-j text-blue-600-j mb-2-j">
                    {feedbacks.length}+
                  </div>
                  <div className="text-gray-600-j">Happy Customers</div>
                </div>
                
                <div className="stat-card-j bg-white-j rounded-lg-j shadow-j p-6-j">
                  <div className="text-4xl-j font-bold-j text-blue-600-j mb-2-j">
                    {feedbacks.length > 0 
                      ? (feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length).toFixed(1)
                      : 'N/A'}
                  </div>
                  <div className="text-gray-600-j">Average Rating</div>
                </div>
                
                <div className="stat-card-j bg-white-j rounded-lg-j shadow-j p-6-j">
                  <div className="text-4xl-j font-bold-j text-blue-600-j mb-2-j">
                    {feedbacks.filter(feedback => feedback.rating >= 4).length}
                  </div>
                  <div className="text-gray-600-j">4+ Star Reviews</div>
                </div>
              </div>
              
              <div className="text-center-j mt-12-j">
                <button className="px-6-j py-3-j bg-blue-600-j text-white-j font-medium-j rounded-lg-j hover:bg-blue-700-j transition-colors-j">
                  Start Your Journey Today
                </button>
              </div>
            </div>
          </section>

          {/* Newsletter Section */}
          <div className="newsletter-section-j">
            <div className="newsletter-content-j">
              <h2>Stay Updated</h2>
              <p>Subscribe to our newsletter and be the first to know about new tour packages and exclusive deals!</p>
              <div className="newsletter-form-j">
                <div className="newsletter-input-wrapper-j">
                  <FaEnvelope className="newsletter-icon-j" />
                  <input type="email" placeholder="Your email address" />
                </div>
                <button>
                  <span>Subscribe</span>
                  <span className="subscribe-hover">Join Now</span>
                </button>
              </div>
            </div>
          </div>
          <BookingFooter/>
        </div>
      )}

      {/* Dialog for Payment */}
      <Dialog open={isDialogOpen} onClose={handleClose} fullWidth maxWidth="md">
        <DialogContent>
          <Payment packageData={viewPackage} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TourPackagesLanding;