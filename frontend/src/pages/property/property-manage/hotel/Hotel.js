import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Hotel.css";
import HotelRoomCard from "../../../../common/hotel-room-card/HotelRoomCard";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import HotelForm from "./HotelForm/HotelForm";

function HotelPage() {
  const [hotelData, setHotelData] = useState([]); // Always array initially
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 

  const userId = localStorage.getItem("userID");

  useEffect(() => {
    getAllHotelRoom();
  }, []);

  const getAllHotelRoom = () => {
    axios
      .post(`http://localhost:4000/api/hotelRoom/getHotelRoomById?userId=${userId}`)
      .then((response) => {
        console.log(response.data);
        setHotelData(response.data || []); // if null, set empty array
      })
      .catch((error) => {
        console.error(error);
        setHotelData([]); // in case of error, set empty array to avoid crash
      });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    getAllHotelRoom();
  };

  // Safe check here 👇
  const filteredHotels = (hotelData || []).filter((hotel) =>
    hotel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel?.availability?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="main-hotel-page">
        <div className="addHotelNav">
          <div className="dataset">
            <div className="dateText">
              <span className="u1">May</span>
              <span className="u2">Today is Saturday, May 9th, 2025</span>
            </div>
            <div className="line"></div>
            <div className="manageTopic">
              <h4>Hotel Manage</h4>
            </div>
          </div>
          <div className="addbtn">
            <button className="addHotelBtn" onClick={handleClickOpen}>
              Add Hotel
            </button>
          </div>
        </div>

        <div className="searchContainer">
          <input
            type="text"
            className="searchInput"
            placeholder="Search by hotel name, room type, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="hotel-card">
          {filteredHotels.map((hotel) => (
            <HotelRoomCard key={hotel.HR_Id} HR_Id={hotel.HR_Id} hotel={hotel} getAllHotelRoom={getAllHotelRoom} />
          ))}
        </div>
      </div>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogContent>
          <HotelForm HR_Id={hotelData?.HR_Id} type="Submit" getAllHotelRoom={getAllHotelRoom} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default HotelPage;
