import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VehicleCard from '../../../../common/vehicle-card/vehicleCard';
import VehicleForm from './vehicleForm/VehicleForm';
import "./Vehicle.css";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

function VehiclePage() {
  const [vehicleData, setVehicleData] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const userId = localStorage.getItem("userID");

  useEffect(() => {
    getAllVehicle();
  }, []);

  const getAllVehicle = () => {
    axios.post(`http://localhost:4000/api/vehicle/getVehicleById?userId=${userId}`)
      .then(response => {
        setVehicleData(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    getAllVehicle();
    setOpen(false);
  };

  // Filtered vehicle list based on search
  const filteredVehicles = vehicleData.filter(vehicle =>
    vehicle.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.fuelType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.transmission?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="main-vehcile-page">

      {/* Header with date and title */}
      <div className="addVehicleNav">
        <div className="dataset">
          <div className="dateText">
            <span className="u1">May</span>
            <span className="u2">Today is Saturday, May 9th, 2025</span>
          </div>
          <div className="line"></div>
          <div className="manageTopic">
            <h4>Vehicle Manage</h4>
          </div>
        </div>

        <div className="addbtn">
          <button className="addVehicleBtn" onClick={handleClickOpen}>Add Vehicle</button>
        </div>
      </div>

      {/* Search input */}
      <div className="searchContainer">
        <input
          type="text"
          className="searchInput"
          placeholder="Search model,transmission,fuel type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Vehicle Cards */}
      <div className="vehicle-card-property">
        {filteredVehicles.map(vehicle => (
          <VehicleCard
            key={vehicle.V_Id}
            V_Id={vehicle.V_Id}
            vehicle={vehicle}
            getAllVehicle={getAllVehicle}
          />
        ))}
      </div>

      {/* Dialog for Add Vehicle Form */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogContent>
          <VehicleForm type="Submit" getAllVehicle={getAllVehicle} />
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

export default VehiclePage;
