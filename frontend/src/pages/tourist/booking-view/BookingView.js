import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "./BookingView.css";
import Footer from '../../landing/Footer/Footer';

import BannerSectionBookingView from './BannerSectionBookingView';
import FeedbackSection  from '../feedback-section/FeedbackSection'

// Import React Icons
import { 
  FaSearch, FaCalendarAlt, FaFlag, FaEdit, 
  FaTrashAlt, FaFilePdf, FaSpinner, FaCalendarCheck,
  FaHotel, FaCar, FaUserTie, FaListAlt, FaCheckCircle,
  FaBed, FaSwimmingPool, FaWifi, FaUtensils, FaCoffee,
  FaParking, FaSnowflake, FaTv
} from 'react-icons/fa';
import { MdDining, MdFreeBreakfast, MdRoomService } from 'react-icons/md';
import { IoArrowForward } from 'react-icons/io5';

const BookingView = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [editBookingId, setEditBookingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list view
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Hotel amenities for editing
  const [hotelAmenities, setHotelAmenities] = useState({
    breakfast: false,
    wifi: false,
    parking: false,
    pool: false,
    airConditioning: false,
    restaurant: false,
    roomService: false,
    tv: false
  });

  useEffect(() => {
    const userID = localStorage.getItem("userID");
    const touristID = localStorage.getItem("touristID");
    const guideId = localStorage.getItem("guideId");

    if (!userID) {
      navigate("/");
      return;
    }

    let endpoint = "";
    let params = {};

    if (touristID) {
      endpoint = "http://localhost:4000/api/booking";
      params = { touristID };
    } else if (guideId) {
      endpoint = "http://localhost:4000/api/booking/guide-book";
      params = { guideId };
    } else {
      const businessName = localStorage.getItem("businessName");
      const bussinessType = localStorage.getItem("bussinessType");
      if (bussinessType === "hotel") {
        endpoint = "http://localhost:4000/api/booking/hotel-book";
        params = { hotelName: businessName };
      } else if (bussinessType === "vehicle") {
        endpoint = "http://localhost:4000/api/booking/vehicle-book";
        params = { B_Id: userID };
      }
    }

    fetchBookings(endpoint, params);
  }, [navigate]);

  const fetchBookings = async (endpoint, params) => {
    try {
      const response = await axios.get(endpoint, { params });
      setBookings(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch bookings. Please try again later.");
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeCategory !== "all" && booking.booking_type !== activeCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.name?.toLowerCase().includes(query) ||
        booking.bookingID?.toLowerCase().includes(query) ||
        new Date(booking.start_date).toLocaleDateString().includes(query)
      );
    }
    return true;
  });

  const handleEditClick = (booking) => {
    setEditBookingId(booking.bookingID);
    setEditFormData({
      ...booking,
      start_date: new Date(booking.start_date).toISOString().split("T")[0],
      end_date: new Date(booking.end_date).toISOString().split("T")[0],
    });
    
    // Set amenities if booking is hotel type
    if (booking.booking_type === "hotel" && booking.amenities) {
      setHotelAmenities(booking.amenities);
    } else {
      // Reset amenities
      setHotelAmenities({
        breakfast: false,
        wifi: false,
        parking: false,
        pool: false,
        airConditioning: false,
        restaurant: false,
        roomService: false,
        tv: false
      });
    }
    
    setShowAdvancedOptions(false);
  };

  const handleCancelEdit = () => {
    setEditBookingId(null);
    setEditFormData({});
    setShowAdvancedOptions(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setEditFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAmenityChange = (amenity) => {
    setHotelAmenities(prev => ({
      ...prev,
      [amenity]: !prev[amenity]
    }));
  };

  const handleUpdateBooking = async (bookingID) => {
    try {
      // Convert dates back to ISO format for the API
      const updatedData = {
        ...editFormData,
        start_date: new Date(editFormData.start_date).toISOString(),
        end_date: new Date(editFormData.end_date).toISOString()
      };
      
      // Add amenities if it's a hotel booking
      if (editFormData.booking_type === "hotel") {
        updatedData.amenities = hotelAmenities;
      }
      
      const response = await axios.put(`http://localhost:4000/api/booking/${bookingID}`, updatedData);
      
      if (response.data) {
        // Update the local state with the response data
        setBookings(bookings.map((b) => (b.bookingID === bookingID ? response.data : b)));
        setEditBookingId(null);
        setEditFormData({});
        showNotification("Booking updated successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to update booking.", "error");
    }
  };

  const handleCancelBooking = async (bookingID) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await axios.delete(`http://localhost:4000/api/booking/${bookingID}`);
        setBookings(bookings.filter((b) => b.bookingID !== bookingID));
        showNotification("Booking cancelled successfully!", "success");
      } catch (err) {
        console.error(err);
        showNotification("Failed to cancel booking.", "error");
      }
    }
  };

  const handleBookingSelection = (bookingID) => {
    setSelectedBookings(prev => {
      if (prev.includes(bookingID)) {
        return prev.filter(id => id !== bookingID);
      } else {
        return [...prev, bookingID];
      }
    });
  };

  const generatePDF = () => {
    const bookingsToExport = selectedBookings.length > 0 
      ? bookings.filter(b => selectedBookings.includes(b.bookingID))
      : filteredBookings;
    
    if (bookingsToExport.length === 0) {
      showNotification("No bookings selected for export", "warning");
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text("Your Booking Details", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    
    let yPos = 40;
    const pageHeight = doc.internal.pageSize.height;
    
    bookingsToExport.forEach((booking, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }
      
      // Add booking info
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPos - 5, 170, 35, 'F');
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`${booking.name}`, 25, yPos);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Booking ID: ${booking.bookingID}`, 25, yPos + 8);
      doc.text(`Type: ${booking.booking_type || 'N/A'}`, 25, yPos + 16);
      doc.text(`Start: ${new Date(booking.start_date).toLocaleDateString()}`, 120, yPos + 8);
      doc.text(`End: ${new Date(booking.end_date).toLocaleDateString()}`, 120, yPos + 16);
      
      // Add amenities if hotel booking
      if (booking.booking_type === "hotel" && booking.amenities) {
        yPos += 40;
        doc.setFont(undefined, 'bold');
        doc.text("Amenities:", 25, yPos);
        doc.setFont(undefined, 'normal');
        
        const amenities = [];
        if (booking.amenities.breakfast) amenities.push("Breakfast");
        if (booking.amenities.wifi) amenities.push("WiFi");
        if (booking.amenities.parking) amenities.push("Parking");
        if (booking.amenities.pool) amenities.push("Pool");
        if (booking.amenities.airConditioning) amenities.push("Air Conditioning");
        if (booking.amenities.restaurant) amenities.push("Restaurant");
        if (booking.amenities.roomService) amenities.push("Room Service");
        if (booking.amenities.tv) amenities.push("TV");
        
        doc.text(amenities.join(", "), 25, yPos + 8);
      }
      
      yPos += 45;
    });
    
    doc.save("booking-details.pdf");
    showNotification("PDF generated successfully!", "success");
  };

  const showNotification = (message, type = "info") => {
    const notification = document.createElement("div");
    notification.className = `-h-notification -h-notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add("-h-show");
      
      setTimeout(() => {
        notification.classList.remove("-h-show");
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    }, 10);
  };

  const getBookingTypeIcon = (type) => {
    switch(type) {
      case 'hotel': return <FaHotel className="-h-type-icon hotel" />;
      case 'vehicle': return <FaCar className="-h-type-icon vehicle" />;
      case 'guide': return <FaUserTie className="-h-type-icon guide" />;
      default: return <FaCalendarCheck className="-h-type-icon" />;
    }
  };

  const renderAmenityIcon = (name) => {
    switch(name) {
      case 'breakfast': return <MdFreeBreakfast />;
      case 'wifi': return <FaWifi />;
      case 'parking': return <FaParking />;
      case 'pool': return <FaSwimmingPool />;
      case 'airConditioning': return <FaSnowflake />;
      case 'restaurant': return <FaUtensils />;
      case 'roomService': return <MdRoomService />;
      case 'tv': return <FaTv />;
      default: return null;
    }
  };

  const renderAmenityLabel = (name) => {
    switch(name) {
      case 'breakfast': return 'Breakfast';
      case 'wifi': return 'WiFi';
      case 'parking': return 'Parking';
      case 'pool': return 'Pool';
      case 'airConditioning': return 'Air Conditioning';
      case 'restaurant': return 'Restaurant';
      case 'roomService': return 'Room Service';
      case 'tv': return 'TV';
      default: return name;
    }
  };

  return (
    <div><BannerSectionBookingView/>
    <div className="-h-booking-container">
      
      <div className="-h-booking-header">
        <h1 className="-h-booking-title">Your Bookings</h1>
        <p className="-h-booking-subtitle">Manage all your travel plans in one place</p>
      </div>

      <div className="-h-booking-controls">
        <div className="-h-search-wrapper">
          <input
            type="text"
            placeholder="Search by name, ID or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="-h-search-input"
          />
          <FaSearch className="-h-search-icon" />
        </div>
        
        <div className="-h-category-buttons">
          <button onClick={() => setActiveCategory("all")} className={`-h-category-btn ${activeCategory === "all" ? "-h-active" : ""}`}>
            <FaListAlt className="-h-btn-icon" /> All
          </button>
          <button onClick={() => setActiveCategory("hotel")} className={`-h-category-btn ${activeCategory === "hotel" ? "-h-active" : ""}`}>
            <FaHotel className="-h-btn-icon" /> Hotels
          </button>
          <button onClick={() => setActiveCategory("vehicle")} className={`-h-category-btn ${activeCategory === "vehicle" ? "-h-active" : ""}`}>
            <FaCar className="-h-btn-icon" /> Vehicles
          </button>
          <button onClick={() => setActiveCategory("guide")} className={`-h-category-btn ${activeCategory === "guide" ? "-h-active" : ""}`}>
            <FaUserTie className="-h-btn-icon" /> Guides
          </button>
        </div>
        
        <div className="-h-view-toggle">
          <button 
            onClick={() => setViewMode("grid")}
            className={`-h-view-btn ${viewMode === "grid" ? "-h-active" : ""}`}
          >
            <span className="-h-grid-icon"></span>
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`-h-view-btn ${viewMode === "list" ? "-h-active" : ""}`}
          >
            <span className="-h-list-icon"></span>
          </button>
        </div>
        
        <button onClick={generatePDF} className="-h-pdf-btn">
          <FaFilePdf className="-h-pdf-icon" /> Generate PDF
        </button>
      </div>

      {loading ? (
        <div className="-h-loading">
          <FaSpinner className="-h-spinner-icon" />
          <p>Loading your bookings...</p>
        </div>
      ) : error ? (
        <div className="-h-error">{error}</div>
      ) : filteredBookings.length === 0 ? (
        <div className="-h-no-bookings">
          <FaCalendarAlt className="-h-empty-icon" />
          <h3>No bookings found</h3>
          <p>Your bookings will appear here once you make a reservation</p>
        </div>
      ) : (
        <>
          <div className="-h-selection-controls">
            <label className="-h-select-label">
              <input 
                type="checkbox" 
                checked={selectedBookings.length === filteredBookings.length}
                onChange={() => {
                  if (selectedBookings.length === filteredBookings.length) {
                    setSelectedBookings([]);
                  } else {
                    setSelectedBookings(filteredBookings.map(b => b.bookingID));
                  }
                }}
              />
              {selectedBookings.length > 0 ? (
                <>
                  <FaCheckCircle className="-h-check-icon" />
                  Selected {selectedBookings.length} booking(s)
                </>
              ) : "Select all"}
            </label>
            
            {selectedBookings.length > 0 && (
              <button onClick={generatePDF} className="-h-export-selected-btn">
                <FaFilePdf className="-h-export-icon" /> Export Selected
              </button>
            )}
          </div>
          
          <div className={`-h-booking-list ${viewMode === "list" ? "-h-list-view" : ""}`}>
            {filteredBookings.map((booking) => (
              <div key={booking.bookingID} className={`-h-booking-card ${booking.booking_type}`}>
                <div className="-h-booking-select">
                  <input
                    type="checkbox"
                    checked={selectedBookings.includes(booking.bookingID)}
                    onChange={() => handleBookingSelection(booking.bookingID)}
                  />
                </div>
                
                <div className="-h-booking-type-tag">
                  {getBookingTypeIcon(booking.booking_type)}
                  {booking.booking_type || "general"}
                </div>
                
                {editBookingId === booking.bookingID ? (
                  <div className="-h-edit-form">
                    <div className="-h-form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name || ""}
                        onChange={handleEditFormChange}
                        className="-h-form-input"
                      />
                    </div>
                    
                    <div className="-h-form-row">
                      <div className="-h-form-group">
                        <label><FaCalendarAlt className="-h-form-icon" /> Start Date</label>
                        <input
                          type="date"
                          name="start_date"
                          value={editFormData.start_date || ""}
                          onChange={handleEditFormChange}
                          className="-h-form-input"
                        />
                      </div>
                      
                      <div className="-h-form-group">
                        <label><FaFlag className="-h-form-icon" /> End Date</label>
                        <input
                          type="date"
                          name="end_date"
                          value={editFormData.end_date || ""}
                          onChange={handleEditFormChange}
                          className="-h-form-input"
                        />
                      </div>
                    </div>
                    
                    {editFormData.booking_type === "hotel" && (
                      <>
                        <div className="-h-form-toggle">
                          <button 
                            type="button" 
                            className="-h-advanced-toggle"
                            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                          >
                            {showAdvancedOptions ? "Hide" : "Show"} Amenities
                          </button>
                        </div>
                        
                        {showAdvancedOptions && (
                          <div className="-h-amenities-section">
                            <h4 className="-h-amenities-title">Hotel Amenities</h4>
                            <div className="-h-amenities-grid">
                              {Object.keys(hotelAmenities).map(amenity => (
                                <div key={amenity} className="-h-amenity-item">
                                  <input
                                    type="checkbox"
                                    id={`amenity-${amenity}`}
                                    checked={hotelAmenities[amenity]}
                                    onChange={() => handleAmenityChange(amenity)}
                                  />
                                  <label htmlFor={`amenity-${amenity}`}>
                                    <span className="-h-amenity-icon">{renderAmenityIcon(amenity)}</span>
                                    {renderAmenityLabel(amenity)}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="-h-form-group">
                          <label>Room Type</label>
                          <select
                            name="roomType"
                            value={editFormData.roomType || "standard"}
                            onChange={handleEditFormChange}
                            className="-h-form-input"
                          >
                            <option value="standard">Standard</option>
                            <option value="deluxe">Deluxe</option>
                            <option value="suite">Suite</option>
                            <option value="executive">Executive</option>
                            <option value="family">Family</option>
                          </select>
                        </div>
                        
                        <div className="-h-form-row">
                          <div className="-h-form-group">
                            <label><FaBed className="-h-form-icon" /> Guests</label>
                            <input
                              type="number"
                              name="guests"
                              min="1"
                              max="10"
                              value={editFormData.guests || "1"}
                              onChange={handleEditFormChange}
                              className="-h-form-input"
                            />
                          </div>
                          
                          <div className="-h-form-group">
                            <label>Special Requests</label>
                            <input
                              type="text"
                              name="specialRequests"
                              placeholder="Any special requirements?"
                              value={editFormData.specialRequests || ""}
                              onChange={handleEditFormChange}
                              className="-h-form-input"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="-h-form-actions">
                      <button onClick={() => handleUpdateBooking(booking.bookingID)} className="-h-update-btn">
                        <FaCheckCircle /> Update
                      </button>
                      <button onClick={handleCancelEdit} className="-h-cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="-h-booking-content">
                    <h2 className="-h-booking-name">{booking.name}</h2>
                    <div className="-h-booking-details">
                      <div className="-h-detail-item">
                        <span className="-h-detail-label">Booking ID:</span>
                        <span className="-h-detail-value">{booking.bookingID}</span>
                      </div>
                      
                      {booking.booking_type === "hotel" && booking.roomType && (
                        <div className="-h-detail-item">
                          <span className="-h-detail-label">Room Type:</span>
                          <span className="-h-detail-value">{booking.roomType}</span>
                        </div>
                      )}
                      
                      {booking.booking_type === "hotel" && booking.guests && (
                        <div className="-h-detail-item">
                          <span className="-h-detail-label">Guests:</span>
                          <span className="-h-detail-value">{booking.guests}</span>
                        </div>
                      )}
                      
                      <div className="-h-booking-dates">
                        <div className="-h-date-item">
                          <FaCalendarAlt className="-h-date-icon" />
                          <div className="-h-date-info">
                            <span className="-h-date-label">Start</span>
                            <span className="-h-date-value">{new Date(booking.start_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="-h-date-connector">
                          <IoArrowForward className="-h-connector-icon" />
                        </div>
                        
                        <div className="-h-date-item">
                          <FaFlag className="-h-date-icon" />
                          <div className="-h-date-info">
                            <span className="-h-date-label">End</span>
                            <span className="-h-date-value">{new Date(booking.end_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {booking.booking_type === "hotel" && booking.amenities && (
                        <div className="-h-amenities-display">
                          <h4 className="-h-amenities-title">Amenities</h4>
                          <div className="-h-amenities-icons">
                            {Object.entries(booking.amenities).map(([key, value]) => (
                              value && (
                                <div key={key} className="-h-amenity-badge" title={renderAmenityLabel(key)}>
                                  {renderAmenityIcon(key)}
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="-h-card-actions">
                      <button onClick={() => handleEditClick(booking)} className="-h-edit-btn">
                        <FaEdit /> Edit
                      </button>
                      <button onClick={() => handleCancelBooking(booking.bookingID)} className="-h-delete-btn">
                        <FaTrashAlt /> Cancel
                      </button>
                      <button onClick={() => {
                        setSelectedBookings([booking.bookingID]);
                        generatePDF();
                      }} className="-h-pdf-single-btn">
                        <FaFilePdf /> PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <FeedbackSection/>
          <Footer/>
        </>
      )}
    </div>
    </div>
  );
};

export default BookingView;