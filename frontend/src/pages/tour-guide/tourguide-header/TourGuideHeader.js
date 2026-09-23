import react from "react";
import './TourGuideHeader.css';
import v8 from '../../../images/v8.png'; 
import v9 from '../../../images/v9.png'; 

function TourGuideHeader(){

    const guideName = localStorage.getItem("guideName");

    return (
        <div class="mainUserDetailNavr">
            <div class="userDetailsub1r">
                 <span class="s1r">Welcome</span>
                 <span class="s2r">{guideName}</span>
            </div>
            <div class="userDetailsub2r">
                <img src={v8} class="iconsr"/>
                <img src={v9} class="iconsr"/>
            </div>

        </div>

    );
}
export default TourGuideHeader;