import React, { useState } from "react";
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Button, 
  Box,
  Grid,
  Rating,
  Chip,
  Divider
} from "@mui/material";
import { 
  BedOutlined, 
  PersonOutlined, 
  AttachMoneyOutlined,
  AcUnitOutlined,
  LocalOfferOutlined
} from "@mui/icons-material";
import BookingHotelForm from "./booking-hotel-form/BookingHotelForm";

const BookingHotelCard = ({ hotel, getAllHotelRoom }) => {
  const [openForm, setOpenForm] = useState(false);

  const handleBookNow = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    getAllHotelRoom();
  };

  // Generate a random rating between 3.5 and 5 for demo purposes
  const rating = Math.floor(Math.random() * (5 - 3.5) * 10) / 10 + 3.5;

  return (
    <>
      <Card sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        height: { xs: 'auto', md: '280px' },
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        borderRadius: 2,
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
        }
      }}>
        {/* Hotel Image */}
        <CardMedia
          component="img"
          sx={{ 
            width: { xs: '100%', md: '40%' },
            height: { xs: '200px', md: '100%' },
            objectFit: 'cover'
          }}
          image={hotel.image || "/api/placeholder/400/320"}
          alt={hotel.name}
        />
        
        {/* Hotel Details */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          width: { xs: '100%', md: '60%' }
        }}>
          <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
            {/* Header with Name and Rating */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h5" component="div" fontWeight="bold">
                {hotel.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating value={rating} precision={0.5} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                  ({(Math.random() * 200 + 50).toFixed(0)} reviews)
                </Typography>
              </Box>
            </Box>
            
            {/* Tags and Availability */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip 
                icon={<AcUnitOutlined fontSize="small" />} 
                label="AC Available" 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                icon={<LocalOfferOutlined fontSize="small" />} 
                label={hotel.availability > 5 ? "High Availability" : "Limited Rooms"} 
                size="small"
                color={hotel.availability > 5 ? "success" : "warning"}
                variant="outlined"
              />
            </Box>
            
            {/* Description */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {hotel.description || "Experience luxury and comfort in our well-appointed rooms with modern amenities and exceptional service."}
            </Typography>
            
            {/* Details Grid */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BedOutlined fontSize="small" color="action" />
                  <Typography variant="body2">{hotel.bed} Bed{hotel.bed > 1 ? 's' : ''}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonOutlined fontSize="small" color="action" />
                  <Typography variant="body2">Max: {hotel.max_occupancy}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyOutlined fontSize="small" color="action" />
                  <Typography variant="body2">
                    ${hotel.price_day}/night &bull; ${hotel.price_month}/month
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
          
          <Divider />
          
          {/* Action Footer */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2
          }}>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              ${hotel.price_day} <Typography component="span" variant="body2" color="text.secondary">per night</Typography>
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleBookNow}
              sx={{ 
                borderRadius: 8,
                px: 3
              }}
            >
              Book Now
            </Button>
          </Box>
        </Box>
      </Card>
      
      {/* Booking Form Dialog */}
      <BookingHotelForm 
        open={openForm} 
        handleClose={handleCloseForm} 
        getAllBooking={getAllHotelRoom}
        selectedHotel={hotel}
      />
    </>
  );
};

export default BookingHotelCard;