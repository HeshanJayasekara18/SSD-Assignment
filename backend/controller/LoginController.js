const User = require('../model/User');
const BussinessAgent = require('../model/BussinessAgent');
const Bussiness = require('../model/Bussiness'); 
const Tourist = require('../model/Tourist');   
const TourGuide = require('../model/TourGuide');


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        console.log("USER DETAILS", user);

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if(user.role=='Bussiness'){
                    
              const businessAgent = await BussinessAgent.findOne({ userID: user.userID });

            if (!businessAgent) {
                return res.status(404).json({ message: "Business agent not found" });
            }

            const business = await Bussiness.findOne({ BA_Id: businessAgent.BA_Id });

            if (!business) {
                return res.status(404).json({ message: "Business details not found" });
            }

            res.status(200).json({
                message: "Login successful",
                userDetails: {
                    userID: user.userID,
                    username: user.username,
                    role: user.role,
                    email: user.email,
                },
                businessDetails: {
                    B_Id: business.B_Id,
                    businessName: business.businessName,
                    businessAddress: business.businessAddress,
                    description: business.description,
                    bussinessType: business.bussinessType,              
                }
        });
        }

        if(user.role=='Tourist'){
            const tourist = await Tourist.findOne({ userID: user.userID });

            if (!tourist) {
                return res.status(404).json({ message: "Tourist not found" });
            }

            res.status(200).json({
                message: "Login successful",
                userDetails: {
                    userID: user.userID,
                    username: user.username,
                    role: user.role,
                    email: user.email,
                },
                touristDetails: {
                    touristID: tourist.touristID,
                    fullname: tourist.fullname,
                    country: tourist.country,
                    mobile_number: tourist.mobile_number,
                }
            });
        }

        if(user.role=='TourGuide'){
            const tourGuide = await TourGuide.findOne({ user: user._id }); // linked by user ObjectId

            if (!tourGuide) {
                return res.status(404).json({ message: "Tour guide not found" });
            }

            return res.status(200).json({
                message: "Login successful",
                userDetails: {
                    userID: user.userID,
                    username: user.username,
                    role: user.role,
                    email: user.email,
                },
                tourGuideDetails: {
                    guideId: tourGuide._id,
                    guideName: tourGuide.guideName,
                }
            });
        
        }



    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login };

