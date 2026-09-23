import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./BookingPayment.css";
import BookingPaymentProcessor from "./BookingPaymentProcessor";
import TourProgressSteps from "../tour-progress-steps/TourProgressSteps";
import BannerSection from "../booking-payment/BannerSectionPayment";

const BookingPayment = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    userID: localStorage.getItem("userID") || "",
    touristID: localStorage.getItem("touristID") || "",
    guideId: localStorage.getItem("guideId") || "",
    tourID: localStorage.getItem("tourID") || `TOUR-${Date.now()}`,
    hotelIds: [],
    vehicleIds: [],
    guideIds: [],
    totalAmount: 0,
    serviceCharge: 0
  });

  // Fetch all bookings associated with the touristID
  useEffect(() => {
    const fetchBookings = async () => {
      const touristID = localStorage.getItem("touristID");
      if (!touristID) {
        setFetchError("Tourist ID not found. Please log in again.");
        setLoading(false);
        return;
      }
    
      try {
        // Get ALL bookings, since there's no endpoint specifically for tourist bookings
        const response = await axios.get("http://localhost:4000/api/booking");
        
        if (response.data && response.data.length > 0) {
          // Filter the bookings for this specific tourist
          const touristBookings = response.data.filter(booking => booking.touristID === touristID);
          
          if (touristBookings.length > 0) {
            setBookings(touristBookings);
            
            // Calculate total amounts
            const bookingAmount = touristBookings.reduce((sum, booking) => sum + (booking.payment_amount || 0), 0);
            const serviceCharge = Math.round(bookingAmount * 0.02); // 2% service charge
            
            // Collect all resource IDs by type
            const hotelBookings = touristBookings.filter(b => b.booking_type === 'hotel').map(b => b.B_Id);
            const vehicleBookings = touristBookings.filter(b => b.booking_type === 'vehicle').map(b => b.B_Id);
            const guideBookings = touristBookings.filter(b => b.booking_type === 'guide').map(b => b.B_Id);
            
            // Update payment data state
            setPaymentData(prev => ({
              ...prev,
              hotelIds: hotelBookings,
              vehicleIds: vehicleBookings,
              guideIds: guideBookings,
              totalAmount: bookingAmount,
              serviceCharge: serviceCharge
            }));
          } else {
            // No bookings for this tourist
            setBookings([]);
          }
        } else {
          // No bookings at all
          setBookings([]);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setFetchError("Failed to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleDelete = async (bookingID) => {
    try {
      await axios.delete(`http://localhost:4000/api/booking/${bookingID}`);
      setBookings(bookings.filter((booking) => booking.bookingID !== bookingID));
      
      // Recalculate totals
      const updatedBookings = bookings.filter((booking) => booking.bookingID !== bookingID);
      const bookingAmount = updatedBookings.reduce((sum, booking) => sum + (booking.payment_amount || 0), 0);
      const serviceCharge = Math.round(bookingAmount * 0.02); // Fixed: Changed 0.1 to 0.02 to match earlier calculation
      
      // Update collection of IDs
      const hotelBookings = updatedBookings.filter(b => b.booking_type === 'hotel').map(b => b.B_Id);
      const vehicleBookings = updatedBookings.filter(b => b.booking_type === 'vehicle').map(b => b.B_Id);
      const guideBookings = updatedBookings.filter(b => b.booking_type === 'guide').map(b => b.B_Id);
      
      setPaymentData(prev => ({
        ...prev,
        hotelIds: hotelBookings,
        vehicleIds: vehicleBookings,
        guideIds: guideBookings,
        totalAmount: bookingAmount,
        serviceCharge: serviceCharge
      }));
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking. Please try again.");
    }
  };

  const handlePayment = () => {
    // Show the payment form
    setShowPaymentForm(true);
  };

  const handlePaymentComplete = async (paymentResponse) => {
    setLoading(true);
    try {
      // Update all bookings with the payment ID
      const updatePromises = bookings.map(booking => 
        axios.patch(`http://localhost:4000/api/booking/${booking.bookingID}`, {
          payID: paymentResponse.payID,
          payment_status: "Completed"
        })
      );
      
      await Promise.all(updatePromises);
      
      alert("Payment successful! All bookings have been updated.");
      
      // Redirect to booking history or dashboard
      window.location.href = "/tourist/dashboard";
    } catch (error) {
      console.error("Error updating bookings after payment:", error);
      alert("Payment was processed but we couldn't update all bookings. Please contact support.");
    } finally {
      setLoading(false);
      setShowPaymentForm(false);
    }
  };

  const handleCancel = () => {
    setShowPaymentForm(false);
  };

  // Format booking data for display
  const formatBookingForDisplay = (booking) => {
    let description = booking.name || "Booking details not available";
    let category = booking.booking_type.charAt(0).toUpperCase() + booking.booking_type.slice(1);
    
    // Check if nested objects exist and extract relevant information
    if (booking.booking_type === 'hotel' && booking.hotel_booking) {
      description = `${booking.hotel_booking.hotel_name} - ${booking.hotel_booking.room_type}`;
      if (booking.hotel_booking.number_of_rooms) {
        description += ` (${booking.hotel_booking.number_of_rooms} rooms)`;
      }
    } else if (booking.booking_type === 'vehicle' && booking.vehicle_booking) {
      description = `${booking.vehicle_booking.vehicle_type} - ${booking.vehicle_booking.pickup_location} to ${booking.vehicle_booking.dropoff_location}`;
    } else if (booking.booking_type === 'guide' && booking.guide_booking) {
      description = `${booking.guide_booking.guide_name} - ${booking.guide_booking.guide_language}`;
      if (booking.guide_booking.guide_experience) {
        description += ` (${booking.guide_booking.guide_experience} years exp)`;
      }
    }
    
    return {
      id: booking.bookingID,
      category: category,
      description: description,
      amount: booking.payment_amount || 0,
      startDate: new Date(booking.start_date).toLocaleDateString(),
      endDate: new Date(booking.end_date).toLocaleDateString()
    };
  };

  // Removed duplicate handlePayment function to resolve redeclaration error.

  return (
    <>
    <BannerSection/>
      {/* Progress Steps Component */}
      <TourProgressSteps currentStep={5}/>
      
      {showPaymentForm ? (
        <div className="payment-processor-container">
          <BookingPaymentProcessor 
            bookingData={{
              bookingID: "TOUR" + Date.now(),
              booking_type: "tour",
              name: "Complete Tour Package",
              payment_amount: paymentData.totalAmount + paymentData.serviceCharge,
              mobile_number: bookings.length > 0 ? bookings[0].mobile_number : "",
              touristID: paymentData.touristID,
              tourID: paymentData.tourID,
              // Add fields required by your CustomizePayment model
              cuspayId: `PAY-${Date.now()}`,
              UserID: paymentData.userID,
              totalAmount: paymentData.totalAmount + paymentData.serviceCharge,
              booking_date: new Date().toISOString(),
              booking_time: new Date().toLocaleTimeString()
            }}
            onPaymentComplete={handlePaymentComplete}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <div className="container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner-large"></div>
              <p>Loading your bookings...</p>
            </div>
          ) : fetchError ? (
            <div className="error-container">
              <p>{fetchError}</p>
              <button className="retry-button" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="no-bookings">
              <p>No bookings found. Start planning your tour first!</p>
              <button 
                className="action-button"
                onClick={() => window.location.href = "/tourist/plan-tour"}
              >
                Plan Your Tour
              </button>
            </div>
          ) : (
            <>
              {/* Booking Table */}
              <div className="booking-table">
                <h2>Your Bookings</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Booking Id</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const formattedBooking = formatBookingForDisplay(booking);
                      return (
                        <tr key={formattedBooking.id}>
                          <td>{formattedBooking.id}</td>
                          <td>{formattedBooking.category}</td>
                          <td>{formattedBooking.description}</td>
                          <td>{formattedBooking.startDate} - {formattedBooking.endDate}</td>
                          <td className="amount">$ {formattedBooking.amount.toLocaleString()}</td>
                          <td>
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="delete-icon"
                              onClick={() => handleDelete(booking.bookingID)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Order Summary */}
              <div className="order-summary">
                <h2>Order Summary</h2>
                <p>Total Amount : $ {paymentData.totalAmount.toLocaleString()}</p>
                <p>Service Charge (%) : $ {paymentData.serviceCharge.toLocaleString()}</p>
                <p className="total-amount"><strong>Total Summary : $ {(paymentData.totalAmount + paymentData.serviceCharge).toLocaleString()}</strong></p>
                
                <div className="id-summary">
                  <p>Tourist ID: {paymentData.touristID || "Not available"}</p>
                  <p>User ID: {paymentData.userID || "Not available"}</p>
                  <p>Tour ID: {paymentData.tourID || "Not available"}</p>
                  {paymentData.guideId && <p>Guide ID: {paymentData.guideId}</p>}
                </div>
                  
                <button 
                  className={`pay-button ${loading ? 'loading' : ''}`}
                  onClick={handlePayment}
                  disabled={loading || bookings.length === 0}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Processing...
                    </>
                  ) : (
                    "Pay Now"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default BookingPayment;