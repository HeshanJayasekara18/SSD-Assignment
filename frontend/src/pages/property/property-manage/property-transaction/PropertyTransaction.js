import React, { useState, useEffect } from 'react';
import "./PropertyTransaction.css";
import v20 from '../../../../images/v20.png'; // Payment success icon
import axios from 'axios';

function PropertyTransaction() {
  const [bookingData, setAllBooking] = useState([]);

  useEffect(() => {
    getAllBooking();
  }, []);

  const getAllBooking = () => {
    axios
      .get(`http://localhost:4000/api/Booking`)
      .then((response) => {
        console.log(response.data);
        setAllBooking(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const generateReport = () => {
    axios
      .post('http://localhost:4000/api/Booking/report', {}, { responseType: 'blob' }) // Set responseType to 'blob'
      .then((response) => {
        const blob = response.data; // Access the blob from the response data
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); // Create an object URL for the blob
        link.download = 'booking_report.pdf'; // Set the download filename
        link.click(); // Trigger the download
      })
      .catch((error) => {
        console.error('Error generating report:', error);
      });
  };

  return (
    <div>
      <div className="transactionNav">
        <div className="dataset">
          <div className="dateText">
            <span className="u1">May</span>
            <span className="u2">Today is Saturday, May 9th, 2025</span>
          </div>
          <div className="line"></div>
          <div className="manageTopic">
            <h4>Transaction Manage</h4>
          </div>
        </div>

        <div className="addbtn">
            <button className="addHotelBtn" onClick={generateReport}>
              Report
            </button>
          </div>
      </div>

      <div className="transaction-container">
        <div className="transaction-row header-row">
          <div className="transaction-cell">Transaction ID</div>
          <div className="transaction-cell">Category</div>
          <div className="transaction-cell">Full Name</div>
          <div className="transaction-cell">Start Date</div>
          <div className="transaction-cell">End Date</div>
          <div className="transaction-cell">Total Amount</div>
          <div className="transaction-cell">Payment Status</div>
        </div>

        {bookingData.map((booking, index) => (
          <div className="transaction-row" key={index}>
            <div className="transaction-cell">{booking.bookingID}</div>
            <div className="transaction-cell">{booking.booking_type || "N/A"}</div>
            <div className="transaction-cell">{booking.fullName || "N/A"}</div>
            <div className="transaction-cell">{booking.start_date?.substring(0, 10)}</div>
            <div className="transaction-cell">{booking.end_date?.substring(0, 10)}</div>
            <div className="transaction-cell">Rs {booking.payment_amount || "0"}</div>
            <div className="transaction-cell" style={{ display: 'flex', alignItems: 'center' }}>
                Paid
                <img className="paidIcon" src={v20} alt="Paid" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PropertyTransaction;
