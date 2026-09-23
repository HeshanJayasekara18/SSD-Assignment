import react from "react";
import "./UserDetailNav.css"

import h8 from '../../images/h8.png'; 
import h9 from '../../images/h9.png'; 

function UserDetailNav(){

    const bussnessName=localStorage.getItem("businessName");

    return (
        <div class="mainUserDetailNav-p">
            <div class="userDetailsub1">
                 <span class="s1">Welcome</span>
                 <span class="s2">{bussnessName}</span>
            </div>
            <div class="userDetailsub2">
                <img src={h8} class="icons"/>
                <img src={h9} class="icons"/>
            </div>

        </div>

    );
}
export default UserDetailNav;