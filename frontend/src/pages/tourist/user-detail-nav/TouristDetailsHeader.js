import React from "react";
import "./TouristDetailsHeader.css";
import v8 from "../../../images/v8.png";
import v9 from "../../../images/v9.png";

function TouristDetailsHeader() {
  return (
    <div className="mainUserDetailNav-h">
      <div className="userDetailsub1-h">
        <span className="s1">Welcome</span>
        <span className="s2">Saman Kumara</span>
      </div>
      <div className="userDetailsub2-h">
        <img src={v8} className="icons" alt="icon1" />
        <img src={v9} className="icons" alt="icon2" />
      </div>
    </div>
  );
}

export default TouristDetailsHeader;
