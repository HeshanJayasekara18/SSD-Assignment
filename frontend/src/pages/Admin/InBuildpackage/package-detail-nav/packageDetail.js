import react from "react";
import './Package-Detail.css';
import v8 from '../../../../images/v8.png'; 
import v9 from '../../../../images/v9.png'; 

function PackageDetail(){
    return (
        <div class="mainUserDetailNav">
            <div class="userDetailsub1">
                 <span class="s1">Welcome</span>
                 <span class="s2">Adminstartor</span>
            </div>
            <div class="userDetailsub2">
                <img src={v8} class="icons"/>
                <img src={v9} class="icons"/>
            </div>

        </div>

    );
}
export default PackageDetail;