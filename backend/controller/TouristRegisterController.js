const User = require ('../model/User');
const Tourist = require ('../model/Tourist'); 
const Tour = require ('../model/Tour');
const Booking = require ('../model/Booking');


const Touristregister = async (req, res) => {
    try {
        const { fullname, email, password, country, mobile_number } = req.body;
      
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered. Please use a different email." });
        }

        const user = await User.create({
            username: email,
            password: password,
            role: 'Tourist',
            email
        });

        // Create Tourist
        const tourist = await Tourist.create({
            username: email,
            fullname: fullname,
            email,
            country,
            mobile_number,
            password: password,
            userID: user.userID
        });

        res.status(201).json({
            message: "User and Tourist created successfully",
            user,
            tourist
        });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTouristDetails = async (req, res) => {
    try {
        const { TtouristID_Id } = req.query;      
        const tourist = await Tourist.findOne({ touristID: touristID });
        if (!tourist) {
            return res.status(404).json({ message: "Tourist not found" });
        }

        const usertourist= await User.findOne({ userID: tourist.userID });
        if (!usertourist) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            tourist:"Tourist Details retrived successfully",
            tourist,
            usertourist
         });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Add to TouristRegisterController.js

// Get all tourists
const getAllTourists = async (req, res) => {
    try {
      // Find all tourists and populate user details
      const tourists = await Tourist.find().sort({ createdAt: -1 });
      
      // Get user details for each tourist
      const touristsWithUserDetails = await Promise.all(
        tourists.map(async (tourist) => {
          const user = await User.findOne({ userID: tourist.userID });
          return {
            ...tourist._doc,
            user: user ? {
              email: user.email,
              role: user.role
            } : null
          };
        })
      );
      
      res.status(200).json({
        success: true,
        count: touristsWithUserDetails.length,
        data: touristsWithUserDetails
      });
    } catch (error) {
      console.error('Error fetching tourists:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching tourists', 
        error: error.message 
      });
    }
  };
  
  // Delete a tourist
  const deleteTourist = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find the tourist
      const tourist = await Tourist.findById(id);
      
      if (!tourist) {
        return res.status(404).json({
          success: false,
          message: 'Tourist not found'
        });
      }
      
      // Get the user ID associated with this tourist
      const userID = tourist.userID;
      
      // Delete the tourist
      await Tourist.findByIdAndDelete(id);
      
      // Delete the associated user
      await User.findOneAndDelete({ userID });
      
      res.status(200).json({
        success: true,
        message: 'Tourist deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting tourist:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting tourist',
        error: error.message
      });
    }
  };
  
  // Update exports
  module.exports = { 
    Touristregister, 
    getTouristDetails,
    getAllTourists,
    deleteTourist
  };
