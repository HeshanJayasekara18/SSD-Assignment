import react from "react";
import "./package-Navbar.css"
import logo from '../../../../images/logo.png';
import v1 from '../../../../images/v1.png';

import v6 from '../../../../images/v6.png';
import v7 from '../../../../images/v7.png';
import j1 from '../../../../images/j1.png';
import j2 from '../../../../images/j2.png';
import j3 from '../../../../images/j3.png';    
import r1 from '../../../../images/r1.png';
import { useNavigate } from "react-router-dom";

function PackageSideNav() {

        const navigate=useNavigate();
    
        const onClickDashboard=()=>{
            navigate('/admin/');
        }
    
        const onClickUserManage=()=>{
            navigate('/admin/user-manage');
        }
    
        const onClickPacakgeManage=()=>{
            navigate('/admin/tour-manage');
        }
        // const onClickEvenatManage=()=>{
        //     navigate('');
        // }
    
        const onClickPaymentManage=()=>{
            navigate('/admin/PaymentManagement');
        }
        const onClickFeedbackManage=()=>{
            navigate('/admin/feedback-manage');
        }

    return (
        <div class="mainSideNav">

            <div>
                <img src={logo} alt="Description of image" />
            </div>

            <div class="sideNavBody">
                <div class="sub1">
                    <div><p>Main</p></div>

                    <div class="sideNavbtn">
                        <img src={v1} className="icons" />
                        <button onClick={onClickDashboard}>Dashboard</button>
                    </div>
                    <div class="sideNavbtn">
                        <img src={j1} className="icons" />
                        <button onClick={onClickUserManage}>User Manage</button>
                    </div>
                    <div class="sideNavbtn">
                        <img src={j2} className="icons" />
                        <button onClick={onClickPacakgeManage}>Tour Manage</button>
                    </div>

                    <div class="sideNavbtn">
                        <img src={j3} className="icons" />
                        <button onClick={onClickPaymentManage}>payment manage</button>
                    </div>
     
                    <div class="sideNavbtn">
                        <img src={r1} className="icons" />
                        <button onClick={onClickFeedbackManage}>Feedback Manage</button>
                    </div>
                    
                    

                </div>





                

                <div class="sub2">
                    <div>
                        <p>Others</p>
                    </div>
                    <div class="sideNavbtn">
                        <img src={v6} className="icons" />
                        <button>Setting</button>
                    </div>
                    <div class="sideNavbtn">
                        <img src={v7} className="icons" />
                        <button>LogOut</button>
                    </div>
                </div>
            </div>

        </div>

    );
}
export default PackageSideNav;