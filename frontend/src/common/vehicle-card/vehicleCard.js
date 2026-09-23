import React from "react";
import './vehicleCard.css';
import v14 from '../../images/v14.png';
import v15 from '../../images/v15.png';
import v16 from '../../images/v16.png';
import v17 from '../../images/v17.png';
import v18 from '../../images/v18.png';
import v24 from '../../images/v24.png';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import {useState} from 'react';
import axios from 'axios';
import VehicleForm from "../../pages/property/property-manage/vehicle/vehicleForm/VehicleForm";

function VehicleCard({ vehicle , getAllVehicle,V_Id }) { 

     const [vehicleData,setVehicleData]=useState([]);
     const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
      };
      const handleClose = () => {
       
        setOpen(false);
      };

      const deleteVehicle = () => {
        if (window.confirm("Are you sure you want to delete this vehicle?")) {
            axios.delete(`http://localhost:4000/api/vehicle/${V_Id}`)
                .then(response => {
                    getAllVehicle();
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    };
    


   

    return (
        <div class="main-vehicle-card">
            <div class="vehicle-image">
                <img class="image" src={vehicle.image}/>
            </div>
            <div class="vehicle-details">
                <img  class="icon" src={v24}/>
                <h6>{vehicle.modelName}</h6>
                <h6 style={{ color: vehicle.priceDay > 6500 ? "red" : "black" }}>
                     ${vehicle.priceDay}
                    </h6>
            </div>
            <div class="vehicle-features">
                <div class="vehicle-features-set">
                    <div class="vehicle-features-item">
                        <img class="vicon" src={v15}/>
                        <h6>{vehicle.seats}</h6>
                    </div>
                    <div class="vehicle-features-item">
                        <img class="vicon" src={v16}/>
                        <h6>{vehicle.fuelType}</h6>
                    </div>
                </div>
                <div class="vehicle-features-set">
                    <div class="vehicle-features-item">
                        <img class="vicon" src={v17}/>
                        <h6>{vehicle.doors}</h6>
                    </div>
                    <div class="vehicle-features-item">
                        <img class="vicon" src={v18}/>
                        <h6>{vehicle.transmission}</h6>
                    </div>

                </div>
            </div>
            <div class="vbtnDiv">           
                    <button class="VeditBtn" onClick={handleClickOpen}>Update</button>
                     <button class="VdeleteBtn"onClick={deleteVehicle}>Delete</button>
            </div>    
          {/* Material UI Dialog Popup */}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" >
         <DialogContent md={{ width: "800px"}}>
            <VehicleForm vehicle={vehicle} type="Update" getAllVehicle ={getAllVehicle}/>
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
export default VehicleCard;