import React, { useState, useEffect } from "react";
import "./HotelForm.css";
import axios from "axios";

function HotelForm({ hotelRoom, type, getAllHotelRoom }) {
  
  useEffect(() => {
    if (type === "Update" && hotelRoom) {
      setFormData({
        B_Id: hotelRoom.B_Id || "B001",
        name: hotelRoom.name || "",
        bed: hotelRoom.bed || 1,
        max_occupancy: hotelRoom.max_occupancy || 1,
        price_day: hotelRoom.price_day || 1,
        price_month: hotelRoom.price_month || 1,
        quantity: hotelRoom.quantity || 1,
        availability: hotelRoom.availability || "",
        description: hotelRoom.description || "",
        image: null, // Image should not be pre-filled for security reasons
      });
    }
  }, [hotelRoom, type]);

  const [formData, setFormData] = useState({
    B_Id: localStorage.getItem("businessID"),
    name: "",
    bed: 1,
    max_occupancy: 1,
    price_day: 0,
    price_month: 0,
    quantity: 1,
    availability: "",
    description: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent empty fields and ensure numbers > 0
    if (
      ["bed", "max_occupancy", "price_day", "price_month", "quantity"].includes(name)
    ) {
      const intValue = parseInt(value, 10);
      if (intValue < 1 || isNaN(intValue)) {
        alert(`${name.replace("_", " ")} must be greater than 0`);
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
    const requiredFields = [
      "name",
      "bed",
      "max_occupancy",
      "price_day",
      "price_month",
      "quantity",
      "availability",
      "description",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`${field.replace("_", " ")} is required`);
        return false;
      }
    }

    if (type === "Submit" && !formData.image) {
      alert("Image is required");
      return false;
    }

    return true;
  };

  const onSubmit = () => {
    if (!validateForm()) return;

    if (type === "Submit") {
      createHotelRoom();
    } else if (type === "Update") {
      updateHotelRoom();
    }
  };

  const createHotelRoom = () => {
    const data = new FormData();

    for (const key in formData) {
        data.append(key, formData[key]);
    }

    data.append("userId", localStorage.getItem("userID")); 
    axios
      .post("http://localhost:4000/api/hotelRoom", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        alert("Hotel Room added successfully!");
        getAllHotelRoom();
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error adding Hotel Room:", error);
      });
  };

  const updateHotelRoom = () => {

    const data = new FormData();

    for (const key in formData) {
        data.append(key, formData[key]);
    }

    data.append("userId", localStorage.getItem("userID")); 

    axios
      .put(`http://localhost:4000/api/hotelRoom/${hotelRoom.HR_Id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        alert("Hotel Room updated successfully!");
        getAllHotelRoom();
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error updating Hotel Room:", error);
      });
  };

  return (
    <div className="MainHotelForm">
      <div className="HotelFormHeader">
        <h4>Hotel {type} Form</h4>
      </div>
      <div className="HformBody">
        <div className="formInputSet">
          <label>Property Name</label>
          <input
            className="HInput"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="formInputSet">
          <label>Beds</label>
          <input
            className="HInput"
            type="number"
            name="bed"
            min="1"
            value={formData.bed}
            onChange={handleChange}
          />
          <label>Max Occupancy</label>
          <input
            className="HInput"
            type="number"
            name="max_occupancy"
            min="1"
            value={formData.max_occupancy}
            onChange={handleChange}
          />
        </div>
        <div className="formInputSet">
          <label>Price/Day</label>
          <input
            className="HInput"
            type="text"
            name="price_day"
            min="1"
            value={formData.price_day}
            onChange={handleChange}
          />
          <label>Price/Month</label>
          <input
            className="HInput"
            type="text"
            name="price_month"
            min="1"
            value={formData.price_month}
            onChange={handleChange}
          />
        </div>
        <div className="formInputSet">
          <label>Quantity</label>
          <input
            className="HInput"
            type="number"
            name="quantity"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
          />
          <label>Status</label>
          <input
            className="HInput"
            type="text"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
          />
        </div>
        <div className="formInputSet">
          <label>Description</label>
          <textarea
            className="HInput"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="formInputSet">
          <label>Image</label>
          <input
            className="HInput"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <div className="Hbtn">
        <button type="button" onClick={onSubmit}>
          {type}
        </button>
      </div>
    </div>
  );
}

export default HotelForm;
