import React, { useState, useEffect } from "react";
import "./BookingGuide.css";
import { useNavigate } from "react-router-dom";
import BannerSectionGuideBook from "./BannerSectionGuideBook";
import { Dialog, DialogContent, DialogActions, Button, Container, Fade } from "@mui/material";
import BookingGuideAvailability from "./booking-guide-availability/BookingGuideAvailability";
import BookingFooter from "../booking-footer/BookingFooter";
import TourProgressSteps from "../tour-progress-steps/TourProgressSteps";
import axios from "axios";

function BookingGuide() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGuideId, setSelectedGuideId] = useState(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/GuideDetails/all-profiles');
      console.log('Fetched guides:', response.data);

      if (Array.isArray(response.data.profiles)) {
        setGuides(response.data.profiles);
      } else {
        console.error('Unexpected API response format:', response.data);
        setGuides([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching guides:', err);
      setError('Failed to load guides. Please try again later.');
      setLoading(false);
    }
  };

  const handleClickOpen = (guideId) => {
    setSelectedGuideId(guideId);
    setIsDialogOpen(true);
  };
  
  const handleClose = () => {
    setIsDialogOpen(false);
    getGuideAvailability();
  };
  
  const getGuideAvailability = () => {
    console.log(`Fetching availability for guide ID: ${selectedGuideId}`);
    // Fetch availability if needed
  };

  const goBackToHotels = () => {
    navigate('/Tourist/hotel-book');
  };

  const proceedToConfirmation = () => {
    navigate('/Tourist/tour-payment');
  };

  const defaultImage = "/placeholder-guide-image.jpg";
  
  return (
    <>
      <BannerSectionGuideBook />

      <div className="tour-progress-container">
        <TourProgressSteps currentStep={4} />
      </div>

      <Container maxWidth="xl" sx={{ py: 4 }}>
      <div className="breadcrumb-guide">
        <span onClick={() => navigate('/')} className="breadcrumb-link-guide">Plan Your Tour</span> &gt;
          <span onClick={() => navigate('/Tourist/vehicle-book')} className="breadcrumb-link-guide">Select Vehicle</span> &gt;
          <span onClick={goBackToHotels} className="breadcrumb-link-guide">Select Hotels</span> &gt;
        <span className="current-guide"> Guide Booking</span>
      </div>
      
        <Fade in={true} timeout={800}>
          <div className="guide-header">
            <h1 className="guide-main-title">Book Your Tour Guide</h1>
            <p className="guide-subtitle">Find the perfect guide for an unforgettable experience</p>
          </div>
        </Fade>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading guides...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
      <div className="guide-container-h">
            {Array.isArray(guides) && guides.length > 0 ? (
              guides.map((guide) => (
                <div className="card-h" key={guide.guideId}>
                  <img 
                    src={guide.image || defaultImage}
                    alt={`Tour Guide ${guide.guideName}`}
                    className="card-image-h"
                    onError={(e) => { e.target.src = defaultImage }}
                  />
            <div className="card-content-h">
                    <div className="rating-h">
                      {guide.rating ? "⭐".repeat(Math.round(guide.rating)) : "⭐⭐⭐⭐⭐"}
                    </div>
                    <h3 className="name-h">{guide.guideName}</h3>
              <p className="price-h">
                      <span className="price-value-h">${guide.price}</span> / Day
              </p>
              <p className="languages-h">Languages - {guide.languages}</p>
                    <p className="experience-h">Experience: {guide.experience}</p>
                    <button 
                      className="book-button-h" 
                      onClick={() => handleClickOpen(guide.guideId)}
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-guides">No tour guides available at the moment.</div>
            )}

            <div className="booking-navigation-buttons">
              <button className="back-button" onClick={goBackToHotels}>
                &larr; Back to Hotels
              </button>
              <button className="next-button" onClick={proceedToConfirmation}>
                Proceed to Confirmation &rarr;
              </button>
            </div>
          </div>
        )}
        
        {/* Dialog for Booking Guide Availability */}
        <Dialog open={isDialogOpen} onClose={handleClose} fullWidth maxWidth="md">
          <DialogContent>
            <BookingGuideAvailability guideId={selectedGuideId} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
        
      <BookingFooter />
    </>
  );
}

export default BookingGuide;
