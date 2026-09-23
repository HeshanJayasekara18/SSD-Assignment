import React from "react";
import "./HotelRoomCard.css";
import v10 from '../../images/v10.png';
import v11 from '../../images/v11.png';
import v13 from '../../images/v13.png';
import v19 from '../../images/v19.png';
import v24 from '../../images/v24.png';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import {useState} from 'react';
import axios from 'axios';
import HotelForm from "../../pages/property/property-manage/hotel/HotelForm/HotelForm";

function HotelRoomCard({hotel,getAllHotelRoom,HR_Id}) {

    
    const [open, setOpen] = useState(false);

            
        // Open & Close Handlers
    const handleClickOpen = () => {
     setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        getAllHotelRoom();

    };

    const deleteHotelRoom = () => {
        if (window.confirm("Are you sure you want to delete this hotel room?")) {
            axios.delete(`http://localhost:4000/api/hotelRoom/${HR_Id}`)
                .then(response => {
                    getAllHotelRoom();
                    console.log(response.data);
                    alert("Hotel room deleted successfully!");
                })
                .catch(error => {
                    console.error(error);
                    alert("Error deleting hotel room!");
                });
        }
    };
    


    return (
        <div className="main-card">
            
            <div className="hotel-card-image">
                <img src={hotel.image}/>
            </div>


            <div class="hotel-card-body">             
             <div class="hotel-card-content">
                <h3>{hotel.name}</h3>
                <img  class="icon" src={v24}/>
                <p class="para">{hotel.description}
                </p>

                <div class="facility">
                    <div class = "facility-item">
                        <img  class="icon" src={v11}/>
                        <p>Beds : {hotel.bed}</p>
                    </div>
                    <div class = "facility-item">
                        <img class="icon" src={v19}/>
                        <p>Occupancy : {hotel.max_occupancy}</p>
                    </div>
                    <div class = "facility-item">
                        <img class="icon" src={v13}/>
                        <p>Free Wifi</p>
                    </div>
                    <div class = "facility-item">
                        <p class="qty">Quantity : {hotel.quantity}</p>
                    </div>


                </div>
           
             </div>

             <div class="btnDiv">
                <div class="btns">
                    <button class="editBtn" onClick={handleClickOpen}>Update</button>
                     <button class="deleteBtn" onClick={deleteHotelRoom}>Delete</button>
                </div>

                <div>
                    <h3 class="price">${hotel.price_day}/Night</h3>
                </div>
            </div>
            

            </div>

            {/* Material UI Dialog Popup */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogContent md={{ width: "500px"}}>
                  <HotelForm hotelRoom={hotel} type="Update" getAllHotelRoom={getAllHotelRoom}/>               
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

export default HotelRoomCard;   