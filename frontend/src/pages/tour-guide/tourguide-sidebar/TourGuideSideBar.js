import react from "react";
import "./TourGuideSideBar.css"
import logo from '../../../images/logo.png';
import dashboardr from '../../../images/dashboardr.png';
import profiler from '../../../images/profiler.png';
import settingsr from '../../../images/settingsr.png';
import logoutr from '../../../images/logoutr.png';
import axios from "axios";
  
import { useNavigate } from "react-router-dom";

function TourGuideSideBar() {

        const navigate=useNavigate();
    
        const onClickDashboard=()=>{
            navigate('/TourGuide');
        }
    
        const onClickProfile=()=>{
            navigate('/Tourguide/profile');
        }

        const handleLogout = async () => {
            if (window.confirm('Are you sure you want to delete your account and logout?')) {
              try {
                const token = localStorage.getItem('token');
                const guideId = localStorage.getItem('guideId');
                
                // Send a request to delete the account
                const response = await axios.delete(`http://localhost:4000/api/GuideDetails/profile/${guideId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
          
                // If the request is successful, clear local storage and navigate to login
                if (response.status === 200) {
                  localStorage.removeItem('token');
                  localStorage.removeItem('guideId');
                  navigate('/login');
                } else {
                  alert('Failed to delete account');
                }
              } catch (error) {
                alert('Error occurred while deleting account');
              }
            }
          };
          
    return (
        <div class="mainSideNavr">

            <div>
                <img src={logo} alt="Description of image" />
            </div>

            <div class="sideNavBodyr">
                <div class="sub1r">
                    <div class="sideNavbtnr">
                        <img src={dashboardr} className="iconsr" />
                        <button onClick={onClickDashboard}>Dashboard</button>
                    </div>
                    <div class="sideNavbtnr">
                        <img src={profiler} className="iconsr" />
                        <button onClick={onClickProfile}>Profile Manage</button>
                    </div>
                </div>

                <div class="sub2r">
                    <div class="sideNavbtnr">
                        <img src={settingsr} className="iconsr" />
                        <button>Setting</button>
                    </div>
                    <div class="sideNavbtnr">
                        <img src={logoutr} className="iconsr" />
                        <button onClick={handleLogout}>LogOut</button>
                    </div>
                </div>
            </div>

        </div>

    );
}
export default TourGuideSideBar;