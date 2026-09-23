import React from "react";
import PropertySideNav from "./property-sideNav/PropertySideNav";
import { Outlet } from "react-router-dom";
import './Property.css';
import UserDetailNav from "../../common/user-detail-nav/UserDetailNav";


function Property (){
    return (
        <div class="main-content">
            <PropertySideNav/>
            <UserDetailNav/>
            <Outlet/>
        </div>
    
    
        


    );
}

export default Property;

  