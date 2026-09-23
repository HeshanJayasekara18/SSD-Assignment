import React, { useState, useEffect } from "react";
import "./VehicleForm.css";
import axios from 'axios';

function VehicleForm({ vehicle, type, getAllVehicle }) {

    // Set data to text field when clicking the update button
    useEffect(() => {
        if (type === "Update" && vehicle) {
            setFormData({
                B_Id: vehicle.B_Id || "B001",
                modelName: vehicle.modelName || "",
                seats: vehicle.seats || 0,
                doors: vehicle.doors || 0,
                fuelType: vehicle.fuelType || "",
                transmission: vehicle.transmission || "",
                priceDay: vehicle.priceDay || 0,
                priceMonth: vehicle.priceMonth || 0,
                status: vehicle.status || "",
                image:null ,
              
            });
        }
    }, [vehicle, type]);

    const [formData, setFormData] = useState({
        B_Id: localStorage.getItem("businessID"),
        modelName: "",
        seats: 0,
        doors: 0,
        fuelType: "",
        transmission: "",
        priceDay: 0,
        priceMonth: 0,
        status: "",
        image: null,
        
    });

    const handleChange = (e) => {
        const { name, value } = e.target;


        if (["seats", "doors", "priceDay", "priceMonth"].includes(name)) {
            const intValue = parseInt(value, 10);
            if (intValue < 1 || isNaN(intValue)) {
                alert(`${name} must be greater than 0`);
                return;
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData({ ...formData, [name]: files[0] });
    };

    const validateForm = () => {
        const { modelName, seats, doors, fuelType, transmission, priceDay, priceMonth, status, image } = formData;

        if (!modelName.trim()) return alert("Model Name is required!");
        if (seats <= 0) return alert("Seats must be greater than 0!");
        if (doors <= 0) return alert("Doors must be greater than 0!");
        if (!fuelType.trim()) return alert("Fuel Type is required!");
        if (!transmission.trim()) return alert("Transmission is required!");
        if (priceDay <= 0) return alert("Price per day must be greater than 0!");
        if (priceMonth <= 0) return alert("Price per month must be greater than 0!");
        if (!status.trim()) return alert("Status is required!");
        if (!image) return alert("Please upload an image!");

        return true; // If all validations pass, return true
    };

    const onSubmit = () => {
        if (!validateForm()) return; // Stop if validation fails

        if (type === "Submit") {
            createVehicle();
        } else if (type === "Update") {
            updateVehicle();
        }
    };

    const createVehicle = () => {

        const data = new FormData();

        for (const key in formData) {
            data.append(key, formData[key]);
        }

        data.append("userId", localStorage.getItem("userID")); 

        axios.post("http://localhost:4000/api/vehicle", data, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        .then(response => {
            alert("Vehicle added successfully!");
            getAllVehicle();
            console.log(response.data);
        })
        .catch(error => {
            console.error("Error adding vehicle:", error);
        });
    };

    const updateVehicle = () => {
        const data = new FormData();

        for (const key in formData) {
            data.append(key, formData[key]);
        }

        data.append("userId", localStorage.getItem("userID")); 

        axios.put(`http://localhost:4000/api/vehicle/${vehicle.V_Id}`, data, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        .then(response => {
            alert("Vehicle updated successfully!");
            getAllVehicle();
            console.log(response.data);
        })
        .catch(error => {
            console.error("Error updating vehicle:", error);
        });
    };

    return (
        <div className="MainVehicleForm">
            <div className="VehicleFormHeader">
                <h4>Vehicle {type} Form</h4>
            </div>
            <div className="VformBody">
                <div className="formInputSet">
                    <label>Model Name</label>
                    <input className="VInput"
                           type="text"
                           name="modelName"
                           value={formData.modelName}
                           onChange={handleChange}
                    />
                </div>
                <div className="formInputSet">
                    <label>Seats</label>
                    <input className="VInput"
                           type="number"
                           name="seats"
                           min="1"
                           value={formData.seats}
                           onChange={handleChange}
                    />
                    <label>Doors</label>
                    <input className="VInput"
                           type="number"
                           name="doors"
                           min="1"
                           value={formData.doors}
                           onChange={handleChange}
                    />
                </div>
                <div className="formInputSet">
                    <label>Fuel Type</label>
                    <input className="VInput"
                           type="text"
                           name="fuelType"
                           value={formData.fuelType}
                           onChange={handleChange}
                    />
                    <label>Transmission</label>
                    <input className="VInput"
                           type="text"
                           name="transmission"
                           value={formData.transmission}
                           onChange={handleChange}
                    />
                </div>
                <div className="formInputSet">
                    <label>Price/Day</label>
                    <input className="VInput"
                           type="text"
                           name="priceDay"
                           value={formData.priceDay}
                           onChange={handleChange}
                    />
                    <label>Price/Month</label>
                    <input className="VInput"
                           type="text"
                           name="priceMonth"
                           value={formData.priceMonth}
                           onChange={handleChange}
                    />
                </div>
                <div className="formInputSet">
                    <label>Status</label>
                    <input className="VInput"
                           type="text"
                           name="status"
                           value={formData.status}
                           onChange={handleChange}
                    />
                </div>
                <div className="formInputSet">
                    <label>Image</label>
                    <input className="VInput"
                           type="file"
                           name="image"
                           accept="image/*"
                           onChange={handleFileChange}
                    />
                </div>
            </div>
            <div className="Vbtn">
                <button type="button" onClick={onSubmit}>{type}</button>
            </div>
        </div>
    );
}

export default VehicleForm;
