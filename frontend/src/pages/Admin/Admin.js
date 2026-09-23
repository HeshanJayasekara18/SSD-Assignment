import React from "react";
import PackageSideNav from "./InBuildpackage/package-navbar/packageNavbar";
import { Outlet } from "react-router-dom";
import PackageDetail from "./InBuildpackage/package-detail-nav/packageDetail";
import PackageBookingHeader from "./InBuildpackage/package-booking-header/PackageBookingHeader";
import "./Admin.css"

function Admin() {
    return(
        <div class="main-content-j">
            <PackageSideNav/>  
             <PackageDetail/> 
            <PackageBookingHeader/>
            <Outlet/>       
        </div>
    );
}

export default Admin;