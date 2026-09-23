import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TourPlan from '../tour-plan/TourPlan';
import VehicleBooking from '../booking-vehicle/BookingVehicle';
import HotelBooking from '../booking-hotel/BookingHotel'
import GuideSelection from '../booking-guide/BookingGuide';
import TourConfirmation from './path/to/TourConfirmation';

// Other imports for your existing routes

const AppRoutes = () => {
  return (
    <Routes>
      {/* Existing routes */}
      <Route path="/" element={<HomePage />} />
      
      {/* Tour booking flow */}
      <Route path="/Tourist/Tourist" element={<TourPlan />} />
      <Route path="/Tourist/vehicle-book" element={<VehicleBooking />} />
      <Route path="/Tourist/hotel-book" element={<HotelBooking />} />
      <Route path="/Tourist/guide-book" element={<GuideSelection />} />
      <Route path="/Tourist/tour-payment" element={<TourConfirmation />} />
      <Route path="/Tourist/my-bookings" element={<MyBookings />} />
      
      {/* Other routes */}
    </Routes>
  );
};

export default AppRoutes;