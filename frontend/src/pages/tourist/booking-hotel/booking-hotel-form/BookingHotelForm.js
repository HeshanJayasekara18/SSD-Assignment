import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Grid,
  Paper,
  FormHelperText,
  InputAdornment
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { 
  HotelOutlined, 
  CalendarMonthOutlined, 
  BedOutlined, 
  PersonOutline, 
  PhoneOutlined,
  PaymentOutlined,
  AcUnitOutlined,
  EventOutlined,
  AttachMoneyOutlined
} from "@mui/icons-material";

const BookingHotelForm = ({ open, handleClose, getAllBooking, selectedHotel }) => {
  const [formData, setFormData] = useState({
    bookingID: "",
    name: "",
    booking_type: "hotel",
    booking_date: dayjs().format("YYYY-MM-DD"),
    booking_time: dayjs().format("HH:mm"),
    start_date: dayjs(),
    end_date: dayjs().add(1, 'day'),
    mobile_number: "",
    payID: "",
    tourID: "",
    touristID: localStorage.getItem("touristID"), 
    payment_amount: "",
    hotel_booking: {
      room_type: "AC", // Default to AC
      number_of_rooms: 1,
      number_of_guests: 1,
    },
  });

  const [errors, setErrors] = useState({});
  const [hotelNames, setHotelNames] = useState([]);
  const [hotelDetails, setHotelDetails] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalNights, setTotalNights] = useState(1);

  useEffect(() => {
    if (open) {
      setFormData((prevData) => ({
        ...prevData,
        booking_date: dayjs().format("YYYY-MM-DD"),
        booking_time: dayjs().format("HH:mm"),
        name: selectedHotel ? selectedHotel.name : "",
        payment_amount: selectedHotel ? selectedHotel.price_day : "",
      }));
      
      if (selectedHotel) {
        setHotelDetails(selectedHotel);
      } else {
        fetchHotelNames();
      }
    }
  }, [open, selectedHotel]);

  // Calculate total nights and price whenever dates change
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const startDate = dayjs(formData.start_date);
      const endDate = dayjs(formData.end_date);
      
      // Calculate number of nights
      const diffInDays = endDate.diff(startDate, 'day');
      const nights = diffInDays > 0 ? diffInDays : 0;
      setTotalNights(nights);
      
      // Calculate total price
      if (hotelDetails && nights > 0) {
        const roomPrice = hotelDetails.price_day;
        const roomCount = formData.hotel_booking.number_of_rooms || 1;
        const roomTypeMultiplier = formData.hotel_booking.room_type === "AC" ? 1.2 : 1;
        
        const calculatedPrice = roomPrice * nights * roomCount * roomTypeMultiplier;
        setTotalPrice(calculatedPrice);
        
        // Update payment amount
        setFormData(prevData => ({
          ...prevData,
          payment_amount: calculatedPrice.toFixed(2)
        }));
      }
    }
  }, [formData.start_date, formData.end_date, formData.hotel_booking.number_of_rooms, formData.hotel_booking.room_type, hotelDetails]);

  const fetchHotelNames = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/hotelrooms");
      const hotels = response.data;
      setHotelNames(hotels);
      
      // If a hotel name is already selected, find its details
      if (formData.name && hotels.length > 0) {
        const selectedHotel = hotels.find(hotel => hotel.name === formData.name);
        if (selectedHotel) {
          setHotelDetails(selectedHotel);
        }
      }
    } catch (error) {
      console.error("Error fetching hotel names:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // If hotel name changes, update hotel details
    if (name === "name" && hotelNames.length > 0) {
      const selectedHotel = hotelNames.find(hotel => hotel.name === value);
      if (selectedHotel) {
        setHotelDetails(selectedHotel);
      }
    }
  };

  const handleHotelBookingChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      hotel_booking: {
        ...formData.hotel_booking,
        [name]: value,
      },
    });
  };

  const handleDateChange = (name, value) => {
    // Prevent selecting past dates for start_date
    if (name === "start_date" && value < dayjs().startOf('day')) {
      setErrors({...errors, start_date: "Cannot select past dates"});
      return;
    }
    
    // Prevent end_date being before start_date
    if (name === "end_date" && formData.start_date && value < formData.start_date) {
      setErrors({...errors, end_date: "End date cannot be before start date"});
      return;
    }
    
    setFormData({ ...formData, [name]: value });
    
    // Clear the error if it was resolved
    if (errors[name]) {
      setErrors({...errors, [name]: ""});
    }
  };

  const validate = () => {
    let tempErrors = {};
    
    // Basic validations
    tempErrors.name = formData.name ? "" : "Hotel name is required";
    tempErrors.start_date = formData.start_date ? "" : "Start date is required";
    tempErrors.end_date = formData.end_date ? "" : "End date is required";
    tempErrors.mobile_number = formData.mobile_number.length === 10 ? "" : "Mobile number must be 10 digits";
    tempErrors.payID = formData.payID ? "" : "Payment ID is required";
    tempErrors.tourID = formData.tourID ? "" : "Tour ID is required";
    tempErrors.touristID = formData.touristID ? "" : "Tourist ID is required";
    
    // Date validations
    if (formData.start_date && formData.start_date < dayjs().startOf('day')) {
      tempErrors.start_date = "Cannot select past dates";
    }
    
    if (formData.end_date && formData.start_date && dayjs(formData.end_date).isBefore(dayjs(formData.start_date))) {
      tempErrors.end_date = "End date cannot be before start date";
    }
    
    // Room validations
    if (formData.hotel_booking.number_of_rooms <= 0) {
      tempErrors.number_of_rooms = "Must book at least one room";
    }
    
    if (formData.hotel_booking.number_of_guests <= 0) {
      tempErrors.number_of_guests = "Must have at least one guest";
    }
    
    // Payment validation
    if (!formData.payment_amount || Number(formData.payment_amount) <= 0) {
      tempErrors.payment_amount = "Payment amount must be greater than zero";
    }

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    
    try {
      // Format data according to your MongoDB schema
      const bookingData = {
        bookingID: uuidv4(), // Generate a new UUID
        name: formData.name,
        booking_type: formData.booking_type,
        booking_date: dayjs(formData.booking_date).toDate(),
        booking_time: formData.booking_time,
        start_date: dayjs(formData.start_date).toDate(),
        end_date: dayjs(formData.end_date).toDate(),
        mobile_number: Number(formData.mobile_number),
        payID: formData.payID,
        tourID: formData.tourID,
        touristID: localStorage.getItem("touristID"),
        payment_amount: Number(formData.payment_amount),
        B_Id:selectedHotel.B_Id,
        
        // Add the hotel_booking object with proper structure
        hotel_booking: {
          hotel_name: formData.name,
          room_type: formData.hotel_booking.room_type,
          number_of_rooms: Number(formData.hotel_booking.number_of_rooms),
          number_of_guests: Number(formData.hotel_booking.number_of_guests)
        }
      };
    
      // Use consistent API endpoint (lowercase is preferred)
      const response = await axios.post("http://localhost:4000/api/booking", bookingData, {
        headers: { "Content-Type": "application/json" }
      });
    
      alert("Successfully booked!");
      getAllBooking(); // Refresh the booking list
      handleClose(); // Close the dialog
    } catch (error) {
      console.error("Error adding booking:", error.response ? error.response.data : error);
      alert("Error making booking. Please check console for details.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            p: 2
          }}
        >
          <HotelOutlined /> 
          Hotel Booking Form
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {/* Summary Box with Hotel Details */}
          {hotelDetails && (
            <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" color="primary">{hotelDetails.name}</Typography>
                <Typography variant="body1" fontWeight="bold">
                  ${hotelDetails.price_day} / night
                </Typography>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BedOutlined fontSize="small" />
                    <Typography variant="body2">Beds: {hotelDetails.bed}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonOutline fontSize="small" />
                    <Typography variant="body2">Max Occupancy: {hotelDetails.max_occupancy}</Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {/* Price Summary */}
              {totalNights > 0 && (
                <Box sx={{ mt: 2, p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="subtitle2">Booking Summary:</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2">
                      {formData.hotel_booking.room_type} Room × {formData.hotel_booking.number_of_rooms} × {totalNights} nights
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ${totalPrice.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          )}
          
          <Grid container spacing={2}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="dense"
                label="Booking Type"
                name="booking_type"
                value={formData.booking_type}
                InputProps={{ 
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <HotelOutlined />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              <TextField
                fullWidth
                margin="dense"
                label="Hotel Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                list="hotel-options"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HotelOutlined />
                    </InputAdornment>
                  )
                }}
              />
              <datalist id="hotel-options">
                {hotelNames.map((hotel, index) => (
                  <option key={index} value={hotel.name} />
                ))}
              </datalist>

              <FormControl fullWidth margin="dense" required>
                <InputLabel>Room Type</InputLabel>
                <Select
                  name="room_type"
                  value={formData.hotel_booking.room_type}
                  onChange={handleHotelBookingChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <AcUnitOutlined />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="AC">AC</MenuItem>
                  <MenuItem value="Non-AC">Non-AC</MenuItem>
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Number of Rooms"
                    type="number"
                    name="number_of_rooms"
                    value={formData.hotel_booking.number_of_rooms}
                    onChange={handleHotelBookingChange}
                    error={!!errors.number_of_rooms}
                    helperText={errors.number_of_rooms}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BedOutlined />
                        </InputAdornment>
                      ),
                      inputProps: { min: 1 }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Number of Guests"
                    type="number"
                    name="number_of_guests"
                    value={formData.hotel_booking.number_of_guests}
                    onChange={handleHotelBookingChange}
                    error={!!errors.number_of_guests}
                    helperText={errors.number_of_guests}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutline />
                        </InputAdornment>
                      ),
                      inputProps: { min: 1 }
                    }}
                  />
                </Grid>
              </Grid>

              <DatePicker
                label="Start Date"
                value={formData.start_date}
                onChange={(value) => handleDateChange("start_date", value)}
                minDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "dense",
                    error: !!errors.start_date,
                    helperText: errors.start_date,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventOutlined />
                        </InputAdornment>
                      )
                    }
                  }
                }}
              />

              <DatePicker
                label="End Date"
                value={formData.end_date}
                onChange={(value) => handleDateChange("end_date", value)}
                minDate={dayjs(formData.start_date).add(1, 'day')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "dense",
                    error: !!errors.end_date,
                    helperText: errors.end_date,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventOutlined />
                        </InputAdornment>
                      )
                    }
                  }
                }}
              />
            </Grid>
            
            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="dense"
                label="Mobile Number"
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                error={!!errors.mobile_number}
                helperText={errors.mobile_number || "10 digits required"}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlined />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                margin="dense"
                label="Pay ID"
                name="payID"
                value={formData.payID}
                onChange={handleChange}
                error={!!errors.payID}
                helperText={errors.payID}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaymentOutlined />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                margin="dense"
                label="Tour ID"
                name="tourID"
                value={formData.tourID}
                onChange={handleChange}
                error={!!errors.tourID}
                helperText={errors.tourID}
                required
              />

              <TextField
                fullWidth
                margin="dense"
                label="Tourist ID"
                name="touristID"
                value={formData.touristID}
                onChange={handleChange}
                error={!!errors.touristID}
                helperText={errors.touristID}
                required
              />

              <TextField
                fullWidth
                margin="dense"
                label="Payment Amount"
                type="number"
                name="payment_amount"
                value={formData.payment_amount}
                onChange={handleChange}
                error={!!errors.payment_amount}
                helperText={errors.payment_amount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyOutlined />
                    </InputAdornment>
                  ),
                  readOnly: true
                }}
              />
              
              <Box sx={{ mt: 2 }}>
                <FormHelperText>
                  * Price is calculated based on room type, number of rooms, and duration of stay
                </FormHelperText>
                <FormHelperText>
                  * AC rooms are priced 20% higher than Non-AC rooms
                </FormHelperText>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={handleClose} 
            variant="outlined" 
            color="error"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            sx={{ ml: 2 }}
          >
            Book Now
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default BookingHotelForm;