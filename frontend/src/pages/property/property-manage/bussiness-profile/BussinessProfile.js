import react from 'react';
import "./BussinessProfile.css"
import React,{useState}from "react";
import {useEffect} from 'react';
import axios from 'axios';

function BussinessProfile (){

    //bussnessDetails ==use State []
    const [bussinessDetails, setBussinessDetails] = useState({
        user: { username: "", email: "", role: "" },
        businessAgent: { fullname: "", userAddress: "", contact: "" },
        business: { businessName: "", businessAddress: "", description: "", bussinessType: "" }
    });



    const [formData,setFormData] = useState({
        bussinessName :"",
        address:"",
        description:"",
        fullName:"",
        userAddress:"",
        contact:"",
        email:"",
        password:"",
        rePassword:""

    });

    const handleChange = (e) => {
        const {name,value} = e.target;
        setFormData({...formData,[name]: value});
    };

    const onUpdate = () => {
        console.log("My Form Data", formData);
    };

    //call thst getAllBussness() in use effect like vehicle getAll()
    useEffect(() => {
        getBussinessDetails();
          }, []);
    

    // getAllBussnessDetails===>Axios get
    const getBussinessDetails = () => {
        axios.get("http://localhost:4000/api/bussinessRegister?B_Id=f1f0a24f-beaf-4c8e-a19b-85dc548d5767")
        .then(response => {
            console.log(response.data);
            setBussinessDetails(response.data);
        })
        .catch(error => {
            console.error("Error fetching business details:", error);
        });
    };
    

    return (
        <div className="profileMainDiv">
            <div className="profileMainForm">
                <div>
                    <h3>Business Profile Detail</h3>
                </div>
                <div className="businessDetails">
                    <h4>Business Details</h4>
                    <div className="mainInput">
                        <div className="inputField">
                            <label>Business Name</label>
                            <input
                                className="input"
                                type="text"
                                name="businessName"
                                value={bussinessDetails.business.businessName}
                                onChange={handleChange}                             
                            />
                        </div>
                        <div className="inputField">
                            <label>Address/City</label>
                            <input
                                className="input"
                                type="text"
                                name="address"
                                value={bussinessDetails.business.businessAddress}
                                onChange={handleChange}                               
                            />
                        </div>
                    </div>

                    <div className="mainInput">
                        <div className="inputField">
                            <label>Description</label>
                            <input
                                className="des"
                                type="text"
                                name="description"
                                value={bussinessDetails.business.description}
                                onChange={handleChange}                             
                            />
                        </div>
                    </div>
                </div>

                <div className="userDetails">
                    <h4>User Details</h4>
                    <div className="mainInput">
                        <div className="inputField">
                            <label>Full Name</label>
                            <input
                                className="input"
                                type="text"
                                name="fullName"
                                value={bussinessDetails.businessAgent.fullname}
                                onChange={handleChange}                              
                            />
                        </div>
                        <div className="inputField">
                            <label>Address</label>
                            <input
                                className="input"
                                type="text"
                                name="userAddress"
                                value={bussinessDetails.businessAgent.userAddress}
                                onChange={handleChange}                              
                            />
                        </div>
                    </div>

                    <div className="mainInput">
                        <div className="inputField">
                            <label>Contact</label>
                            <input
                                className="input"
                                type="text"
                                name="contact"
                                value={bussinessDetails.businessAgent.contact}
                                onChange={handleChange}                             
                            />
                        </div>
                        <div className="inputField">
                            <label>Email</label>
                            <input
                                type="text"
                                className="input"
                                name="email"
                                value={bussinessDetails.user.email}
                                onChange={handleChange}               
                            />
                        </div>
                    </div>

                    <div className="mainInput">
                        <div className="inputField">
                            <label>Password</label>
                            <input
                                type="password"
                                className="input"
                                name="password"
                               
                                onChange={handleChange}                             
                            />
                        </div>
                        <div className="inputField">
                            <label>Re-Password</label>
                            <input
                                type="password"
                                className="input"
                                name="rePassword"
                               
                                onChange={handleChange}                             
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <button className="updateBtn" type="button" onClick={onUpdate} >
                        Update
                    </button>
                </div>
            </div>
        </div>

    );
}


export default BussinessProfile;