import React from "react";
import TourGuideSideBar from "./tourguide-sidebar/TourGuideSideBar";
import { Outlet } from "react-router-dom";
//import PackageDetail from "./InBuildpackage/package-detail-nav/packageDetail";

import "./TourGuide.css"
import TourGuideHeader from "./tourguide-header/TourGuideHeader";

function TourGuide() {
    return(
        <div class="main-content-j">
            <TourGuideSideBar/>  
            <TourGuideHeader/>
            
            <Outlet/>       
        </div>
    );
}

export default TourGuide;