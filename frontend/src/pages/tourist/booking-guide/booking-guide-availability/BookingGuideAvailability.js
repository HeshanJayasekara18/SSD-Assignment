import React, { useState, useEffect } from 'react';
import { Button } from "@mui/material";
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb'; // Import the locale you want to use
import BookingGuideBooking from './booking-guide-booking/BookingGuideBooking';
import './BookingGuideAvailability.css';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];

const BookingGuideAvailability = ({ open, handleClose }) => {
  
  const [selectedDates, setSelectedDates] = useState([]); // ✅ Multiple dates support
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [openBookingPopup, setOpenBookingPopup] = useState(false);
  const [availableDates, setAvailableDates] = useState([]); // ✅ Store available dates

  // Fetch available dates from database (Mock API call)
  useEffect(() => {
    const fetchAvailableDates = async () => {
      const dbDates = ["2025-04-10", "2025-04-12", "2025-04-15", "2025-04-18"];
      setAvailableDates(dbDates);
    };
    fetchAvailableDates();
  }, []);

  // Handle date selection (✅ Allows multiple selections)
  const handleDateClick = (day) => {
    const formattedDate = dayjs(`${currentYear}-${currentMonth + 1}-${day}`).format("YYYY-MM-DD");

    if (dayjs(formattedDate).isBefore(dayjs(), "day")) {
      return; // ❌ Prevent selecting past dates
    }

    setSelectedDates((prev) =>
      prev.includes(formattedDate) ? prev.filter((d) => d !== formattedDate) : [...prev, formattedDate]
    );
  };

  const handleNextClick = () => {
    if (selectedDates.length > 0) {
      setOpenBookingPopup(true); // ✅ Open Booking popup
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    let days = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()) return;
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    setCurrentYear((prev) => (currentMonth === 0 ? prev - 1 : prev));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    setCurrentYear((prev) => (currentMonth === 11 ? prev + 1 : prev));
  };

  const calendarDays = generateCalendarDays();

  return (
    <>
      <div className="availability-container-h">
        <h2 className="availability-title-h">Availability</h2>

        <div className="availability-content-h">
          {/* Guide Profile */}
          <div className="guide-card-h">
            <img src="/api/placeholder/200/160" alt="Guide profile" className="guide-image-h" />
            <h3 className="guide-name-h">Saman Kumara</h3>
            <p className="guide-price-h">$2750 / Day</p>
            <p className="language-list-h">Languages: English, French</p>
            <button className="view-profile-btn-h">View Profile</button>
          </div>

          {/* Calendar */}
          <div className="calendar-container-h">
            <div className="calendar-header-h">
              <p className="select-text-h">Please Select Tour Days</p>
              <div className="month-navigation-h">
                <button className="month-nav-btn-h" onClick={handlePrevMonth}>&lt;</button>
                <h3 className="current-month-h">{`${months[currentMonth]} ${currentYear}`}</h3>
                <button className="month-nav-btn-h" onClick={handleNextMonth}>&gt;</button>
              </div>
            </div>

            <div className="calendar-grid-h">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, index) => (
                <div key={index} className="weekday-header-h">{day}</div>
              ))}

              {calendarDays.map((day, index) => {
                if (!day) return <div key={index} className="empty-h" />;

                const formattedDate = dayjs(`${currentYear}-${currentMonth + 1}-${day}`).format("YYYY-MM-DD");
                const isPast = dayjs(formattedDate).isBefore(dayjs(), "day");
                const isSelected = selectedDates.includes(formattedDate);
                const isAvailable = availableDates.includes(formattedDate);

                return (
                  <div
                    key={index}
                    className={`calendar-day-h ${isSelected ? 'selected-h' : ''} ${isPast ? 'disabled-h' : ''} ${isAvailable ? 'available-h' : ''}`}
                    onClick={() => isAvailable && !isPast && handleDateClick(day)}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="action-buttons-h">
          <Button onClick={handleClose} color="primary">Close</Button>
          <Button
            className="next-btn-h"
            variant="contained"
            color="secondary"
            onClick={handleNextClick}
            disabled={selectedDates.length === 0} // ✅ Enable only if dates selected
>
            Next
          </Button>
        </div>
      </div>

      {/* Booking Popup */}
      <BookingGuideBooking open={openBookingPopup} handleClose={() => setOpenBookingPopup(false)} selectedDates={selectedDates} />
    </>
  );
};

export default BookingGuideAvailability;
