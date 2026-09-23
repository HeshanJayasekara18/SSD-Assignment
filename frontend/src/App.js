import logo from './logo.svg';
import './App.css';
import 'leaflet/dist/leaflet.css';

import {BrowserRouter,Route,Routes}from 'react-router-dom';
import PropertySignup from './pages/property/property-signup/PropertySignup';
import Property from './pages/property/Property';
import HotelPage from './pages/property/property-manage/hotel/Hotel';
import VehiclePage from './pages/property/property-manage/vehicle/Vehicle';
import PropertyDashboard from './pages/property/property-manage/property-dashboard/PropertyDashboard';
import PropertyTransaction from './pages/property/property-manage/property-transaction/PropertyTransaction';
import BussinessProfile from './pages/property/property-manage/bussiness-profile/BussinessProfile';
import Admin from './pages/Admin/Admin';
import TourPackagesLanding from './pages/tourist/packageInBuild/InBuildPackageLanding'
import SimpleDashboard from './pages/Admin/InBuildpackage/Dashboard/Dashboard';
import UserManagement from './pages/Admin/InBuildpackage/adminUsermanage/AdminUserManagement';
import DisplayDetails from './pages/Admin/InBuildpackage/packagedisplaydetails/DisplayDetails';
import PackagePayment from './pages/Admin/InBuildpackage/paymentpage/PackagePayment';
import PaymentManagement from './pages/Admin/InBuildpackage/adminpaymentmanage/PaymentManagement'
import BookingGuide from './pages/tourist/booking-guide/BookingGuide';
import BookingGuideBooking from './pages/tourist/booking-guide/booking-guide-availability/booking-guide-booking/BookingGuideBooking';
import BookingHotel from './pages/tourist/booking-hotel/BookingHotel'
import BookingPayment from './pages/tourist/booking-payment/BookingPayment';
import BookingVehicle from './pages/tourist/booking-vehicle/BookingVehicle';
import TourPlan from './pages/tourist/tour-plan/TourPlan';
import Receipt from'./pages/Admin/InBuildpackage/receipt/Receipt';
import FeedbackManagement from './pages/Admin/feedback-manage/feedback-management/FeedbackManagement';

import CustomerFeedback from './pages/tourist/feedback-section/FeedbackSection';
import Tourist from './pages/tourist/Tourist';
import TouristDetailsHeader from './pages/tourist/user-detail-nav/TouristDetailsHeader';
import TouristProfile from './pages/tourist/tourist-profile/TouristProfile';
import BookingGuideAvailability from './pages/tourist/booking-guide/booking-guide-availability/BookingGuideAvailability'
import MainLogin from './common/main-login/MainLogin';
import TouristSignup from './pages/tourist/tourist-signup/TouristSignup';
import LandingPages from './pages/landing/Landing';
import BookingView from './pages/tourist/booking-view/BookingView';

import TourGuideDashboard from './pages/tour-guide/tourguide-dashboard/TourGuideDashboard';
import TourGuideProfile from './pages/tour-guide/tourguide-profile/TourGuideProfile';
import TourGuideSignUp from './pages/tour-guide/tourguide-signup/TourGuideSignUp';
import TourGuide from './pages/tour-guide/TourGuide';
import ChatManage from './pages/property/chat-manage/Chat';


import FeedbackForm from './common/feedback-rating/feedback-page/FeedbackForm';
import TouristFeedbackDisplay from './common/feedback-rating/feedback-display/TouristFeedbackDisplay';



import Gallary from './pages/landing/gallary/Gallary'

import LandingAfterLogin from './pages/tourist/landing-after-login/LandingAfterLogin';
function App() {
  return (
    
        <BrowserRouter>
          <Routes>
            <Route path="/tourist-signup" element={<TouristSignup/>}/>
            <Route path="/property-signup" element={<PropertySignup/>}/>
            <Route path="/login" element={<MainLogin/>}/>
            <Route path="/" element={<LandingPages/>}/>
            <Route path='/tourguide-signup' element={<TourGuideSignUp/>}/>

            
            
            
            <Route
               path='/admin'
               element={<Admin/>}>
                <Route index element={<SimpleDashboard/>}/>
                <Route path='user-manage' element={<UserManagement/>}/>
                <Route path='tour-manage' element={<DisplayDetails/>}/>
                <Route path='PackagePayment' element={<PackagePayment/>}/>
                <Route path='Receipt' element={<Receipt/>}/>
                <Route path='PaymentManagement' element={<PaymentManagement/>}/>
                <Route path='feedback-manage' element={<FeedbackManagement/>}/>

               
            </Route>

            <Route
               path='/property'
               element={<Property/>}>
                <Route index element={<PropertyDashboard/>}/>
                <Route path='profile' element={<BussinessProfile/>}/>
                <Route path='hotel' element={<HotelPage/>}/>
                <Route path='vehicle' element={<VehiclePage/>}/>
                <Route path='transaction' element={<PropertyTransaction/>}/>
                <Route path='chat' element={<ChatManage/>}/>
            </Route>

            <Route
               path='/Tourist'
               element={<Tourist/>}>
                <Route index element={<TourPlan/>}/>
                <Route path='hotel-book' element={<BookingHotel/>}/>
                <Route path='vehicle-book' element={<BookingVehicle/>}/>
                <Route path='guide-book' element={<BookingGuide/>}/>
                <Route path='Profile' element={<TouristProfile/>}/>
                <Route path='guide-availability' element={<BookingGuideAvailability/>}/>
                <Route path='guide-booking' element={<BookingGuideBooking/>}/>
                <Route path='package' element={<TourPackagesLanding/>}/>
                <Route path='booking-view' element={<BookingView/>}/>
                <Route path='feedback' element={<FeedbackForm/>}/>
                <Route path='feedback-display' element={<TouristFeedbackDisplay/>}/>
                
                <Route path='booking-view' element={<BookingView/>}/>
                <Route path='Home' element={<LandingAfterLogin/>}/>
                <Route path='tour-payment' element={<BookingPayment/>}/>
                <Route path='package' element={<TourPackagesLanding/>}/>
                <Route path='gallary' element={<Gallary/>}/>
            </Route>
            
            

             <Route
                path='/TourGuide'
                element={<TourGuide/>}>
                <Route index element={<TourGuideDashboard/>}/>
                 <Route path='profile' element={<TourGuideProfile/>}/>
              </Route>
            
          
          </Routes>
        </BrowserRouter>
  
  )
}

export default App;
