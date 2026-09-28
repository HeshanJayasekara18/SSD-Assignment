import axios from "axios";
import weblogo from '../../../images/logo.png';
import './BookingNavbar.css';
import { useNavigate } from "react-router-dom";


const BookingNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        await axios.post(
            "http://localhost:4000/api/Login/logout"
        );

        localStorage.removeItem("userID");
        localStorage.removeItem("touristID");
        localStorage.removeItem("fullname");

        navigate("/login");

    } catch (error) {
        console.error("Logout failed");
    }
};

  return (
    <div className="landingLandingPage-h">
      <nav className="landingNavigation-h">
        <div className="landingLogo-h"><img src={weblogo} alt="Logo" /></div>
        <div className="landingNavLinks-h">
          <span href="#" className="landingNavLink-h" onClick={() => navigate('/#')}>Home</span>
          <span className="landingNavLink-h" onClick={() => navigate('/login')}>Plan your tour</span>

          <span className="landingNavLink-h" onClick={() => navigate('/tourist')}>Our Packages</span>
          <span className="landingNavLink-h" onClick={() => navigate('/tourist')}>Gallery</span>
          <span className="landingNavLink-h" onClick={() => navigate('/tourist')}>Contact</span>
          <span className="landingNavLink-h" onClick={() => navigate('/tourist')}>Join with us</span>
        </div>
        <div className="landingRegbutton-h">
          
          
          <button className="landinglogbutton-h" onClick={handleLogout}>Log out</button>
        </div>
      </nav>
</div>

  )   
};

export default BookingNavbar;