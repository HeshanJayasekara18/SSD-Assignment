import React from "react";
import BookingNavbar from "./booking-navbar/BookingNavbar";
import BookingNavAfterLog from "./booking-navbar-afterlog/BookingNavAfterLog";
import { Outlet } from "react-router-dom";
import BookingFooter from "./booking-footer/BookingFooter";

function Tourist(){
    return(
        <div>
        
            <BookingNavAfterLog/>
            
            <Outlet/>
        </div>
    )
}
export default Tourist;