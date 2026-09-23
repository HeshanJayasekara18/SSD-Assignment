import React, { useState } from "react";
import "./MainLogin.css";
import hlogo from '../../images/h-Logo.png'; 
import hloginimg from '../../images/h-Login-img.jpeg'; 
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const MainLogin = () => {
  const navigate = useNavigate();

  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmitLogin = () => {

    if(email === "admin@gmail.com" || password === "admin123") {
     navigate('/admin');
      return;
    } 

    const loginData = {
      email: email,
      password: password
    };

    axios.post('http://localhost:4000/api/login', loginData)
      .then(response => {       
        console.log('Login successful:', response.data);
       

        if (response.data.userDetails.role === 'Bussiness') {
          navigate('/property');
          localStorage.setItem("userID",response.data.userDetails.userID);
          localStorage.setItem("businessName",response.data.businessDetails.businessName); 
          localStorage.setItem("bussinessType",response.data.businessDetails.bussinessType); 
          localStorage.setItem("businessID",response.data.businessDetails.B_Id);
        } 

        if(response.data.userDetails.role === 'Tourist') {
          navigate('/Tourist');
          localStorage.setItem("userID",response.data.userDetails.userID);
          localStorage.setItem("touristID",response.data.touristDetails.touristID);
          localStorage.setItem("fullname",response.data.touristDetails.fullname);
        }
        
        if(response.data.userDetails.role === "TourGuide") {
          console.log("Tour Guide Login",response.data.tourGuideDetails.guideId);
          navigate('/TourGuide');
          localStorage.setItem("userID",response.data.userDetails.userID);
          localStorage.setItem("guideId",response.data.tourGuideDetails.guideId);
          localStorage.setItem("guideName",response.data.tourGuideDetails.guideName);
        }

      })
      .catch(error => {     
        console.error('Login failed:', error.response ? error.response.data : error.message);
      });
  };

  const onClickBussnessRegister = () => {
    navigate('/property-signup');
  };

  const onClickToursitRegister = () => {
    navigate('/tourist-signup');
  };

  const onClickGuideRegister = () => {
    navigate('/tourguide-signup'); // or your tour guide signup route
  };

  return (
    <div className="container-login">
      {/* Left Side - Login Form */}
      <div className="left-panel-login">
        <div>
          <img src={hlogo} alt="CeylonGO" className="logo-login" />
        </div>
        <h2 className="title-login">Sign in</h2>
        <p className="subtitle-login">Please login to continue to your account</p>

        {/* Login Form */}
        <div className="form-login">
          <label>Email</label>
          <input
            className=".inputLogin"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
          className="inputLogin"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="button-login" onClick={onSubmitLogin}>Sign in</button>
        </div>

        {/* Divider */}
        <div className="divider-login">
          <div className="divider-line-login"></div>
          <span className="divider-text-login">or</span>
          <div className="divider-line-login"></div>
        </div>

        {/* Sign Up Buttons */}
        <button className="signup-button-login" onClick={onClickToursitRegister}>Sign Up Tourist</button>
        <button className="signup-button-login" onClick={onClickBussnessRegister}>Sign Up Business</button>
        <button className="signup-button-login" onClick={onClickGuideRegister}>Sign Up Tour Guide</button>
      </div>

      {/* Right Side - Image */}
      <div className="right-panel-login">
        <img src={hloginimg} alt="Background" />
      </div>
    </div>
  );
};

export default MainLogin;
