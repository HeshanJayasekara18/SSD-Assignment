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
  DirectionsCarOutlined, 
  CalendarMonthOutlined, 
  PersonOutline, 
  PhoneOutlined,
  PaymentOutlined,
  LocalGasStationOutlined,
  EventOutlined,
  AttachMoneyOutlined,
  LocationOnOutlined,
  SettingsOutlined
} from "@mui/icons-material";

const BookingVehicleForm = ({ open, handleClose, getAllBooking, selectedVehicle,tourID }) => {
  const [formData, setFormData] = useState({
    bookingID: "",
    name: "",
    booking_type: "vehicle",
    booking_date: dayjs().format("YYYY-MM-DD"),
    booking_time: dayjs().format("HH:mm"),
    start_date: dayjs(),
    end_date: dayjs().add(1, 'day'),
    mobile_number: "",
    payID: "",
    tourID: tourID || "",
    touristID: localStorage.getItem("touristID") || "",
    payment_amount: "",
    vehicle_booking: {
      vehicle_type: "",
      driver_name: "",
      pickup_location: "",
      dropoff_location: ""
    },
  });

  const [errors, setErrors] = useState({});
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDays, setTotalDays] = useState(1);

  useEffect(() => {
    if (open) {
      setFormData((prevData) => ({
        ...prevData,
        booking_date: dayjs().format("YYYY-MM-DD"),
        booking_time: dayjs().format("HH:mm"),
        name: selectedVehicle ? selectedVehicle.modelName : "",
        payment_amount: selectedVehicle ? selectedVehicle.priceDay : "",
        vehicle_booking: {
          ...prevData.vehicle_booking,
          vehicle_type: selectedVehicle ? selectedVehicle.modelName : ""
        },
        touristID: localStorage.getItem("touristID") || ""
      }));
      
      if (selectedVehicle) {
        setVehicleDetails(selectedVehicle);
      }
    }
  }, [open, selectedVehicle]);

  // Calculate total days and price whenever dates change
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const startDate = dayjs(formData.start_date);
      const endDate = dayjs(formData.end_date);
      
      // Calculate number of days
      const diffInDays = endDate.diff(startDate, 'day');
      const days = diffInDays > 0 ? diffInDays : 0;
      setTotalDays(days);
      
      // Calculate total price
      if (vehicleDetails && days > 0) {
        // If more than 30 days, use monthly price for calculation
        let calculatedPrice = 0;
        
        if (days >= 30) {
          const months = Math.floor(days / 30);
          const remainingDays = days % 30;
          calculatedPrice = (months * vehicleDetails.priceMonth) + (remainingDays * vehicleDetails.priceDay);
        } else {
          calculatedPrice = days * vehicleDetails.priceDay;
        }
        
        setTotalPrice(calculatedPrice);
        
        // Update payment amount
        setFormData(prevData => ({
          ...prevData,
          payment_amount: calculatedPrice.toFixed(2)
        }));
      }
    }
  }, [formData.start_date, formData.end_date, vehicleDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVehicleBookingChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      vehicle_booking: {
        ...formData.vehicle_booking,
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
    tempErrors.name = formData.name ? "" : "Vehicle name is required";
    tempErrors.start_date = formData.start_date ? "" : "Start date is required";
    tempErrors.end_date = formData.end_date ? "" : "End date is required";
    tempErrors.mobile_number = formData.mobile_number.length === 10 ? "" : "Mobile number must be 10 digits";
    tempErrors.payID = formData.payID ? "" : "Payment ID is required";
    tempErrors.tourID = formData.tourID ? "" : "Tour ID is required";
    tempErrors.touristID = formData.touristID ? "" : "Tourist ID is required";
    
    // Vehicle booking validations
    tempErrors.driver_name = formData.vehicle_booking.driver_name ? "" : "Driver name is required";
    tempErrors.pickup_location = formData.vehicle_booking.pickup_location ? "" : "Pickup location is required";
    tempErrors.dropoff_location = formData.vehicle_booking.dropoff_location ? "" : "Dropoff location is required";
    
    // Date validations
    if (formData.start_date && formData.start_date < dayjs().startOf('day')) {
      tempErrors.start_date = "Cannot select past dates";
    }
    
    if (formData.end_date && formData.start_date && dayjs(formData.end_date).isBefore(dayjs(formData.start_date))) {
      tempErrors.end_date = "End date cannot be before start date";
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
        tourID: tourID,
        touristID: localStorage.getItem("touristID"), 
        payment_amount: Number(formData.payment_amount),
        B_Id:selectedVehicle.B_Id,
        
        // Add the vehicle_booking object with proper structure
        vehicle_booking: {
          vehicle_type: formData.vehicle_booking.vehicle_type || formData.name,
          driver_name: formData.vehicle_booking.driver_name,
          pickup_location: formData.vehicle_booking.pickup_location,
          dropoff_location: formData.vehicle_booking.dropoff_location
        }
      };
    
      // Use consistent API endpoint
      const response = await axios.post("http://localhost:4000/api/booking", bookingData, {
        headers: { "Content-Type": "application/json" }
      });
    
      alert("Vehicle successfully booked!");
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
          <DirectionsCarOutlined /> 
          Vehicle Booking Form
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {/* Summary Box with Vehicle Details */}
          {vehicleDetails && (
            <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" color="primary">{vehicleDetails.modelName}</Typography>
                <Typography variant="body1" fontWeight="bold">
                  ${vehicleDetails.priceDay} / day | ${vehicleDetails.priceMonth} / month
                </Typography>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonOutline fontSize="small" />
                    <Typography variant="body2">Seats: {vehicleDetails.seats}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalGasStationOutlined fontSize="small" />
                    <Typography variant="body2">{vehicleDetails.fuelType}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsOutlined fontSize="small" />
                    <Typography variant="body2">{vehicleDetails.transmission}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsCarOutlined fontSize="small" />
                    <Typography variant="body2">{vehicleDetails.doors} Doors</Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {/* Price Summary */}
              {totalDays > 0 && (
                <Box sx={{ mt: 2, p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="subtitle2">Booking Summary:</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2">
                      {vehicleDetails.modelName} × {totalDays} days
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
                      <DirectionsCarOutlined />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              <TextField
                fullWidth
                margin="dense"
                label="Vehicle Model"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                InputProps={{
                  readOnly: !!selectedVehicle,
                  startAdornment: (
                    <InputAdornment position="start">
                      <DirectionsCarOutlined />
                    </InputAdornment>
                  )
                }}
              />

             
              

              <TextField
                fullWidth
                margin="dense"
                label="Pickup Location"
                name="pickup_location"
                value={formData.vehicle_booking.pickup_location}
                onChange={handleVehicleBookingChange}
                error={!!errors.pickup_location}
                helperText={errors.pickup_location}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnOutlined />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                margin="dense"
                label="Dropoff Location"
                name="dropoff_location"
                value={formData.vehicle_booking.dropoff_location}
                onChange={handleVehicleBookingChange}
                error={!!errors.dropoff_location}
                helperText={errors.dropoff_location}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnOutlined />
                    </InputAdornment>
                  )
                }}
              />

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
              
              {/* business id */}
              <TextField
                fullWidth
                margin="dense"
                label="Business ID"
                name="B_Id"
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
                  * Price is calculated based on the duration of your reservation
                </FormHelperText>
                <FormHelperText>
                  * For bookings longer than 30 days, monthly rates will apply
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
            Book Vehicle
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default BookingVehicleForm;