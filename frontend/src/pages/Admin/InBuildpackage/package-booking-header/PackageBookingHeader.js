import React from "react";
import "./PackageBookingHeader.css";

function PackageBookingHeader() {
    // Get current date in proper format
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);

    return (
        <div className="booking-header">
            <div className="header-left">
                <div className="date-section">
                    <p>{formattedDate}</p>
                </div>
            </div>
            
            <h2 className="header-title">Welcome to CeylonGo </h2>
            
            <div className="header-right">
                
                
            </div>
        </div>
    );
}

export default PackageBookingHeader;