const bcrypt = require("bcrypt");
const User = require('../model/User');
const BussinessAgent = require('../model/BussinessAgent');
const Bussiness = require('../model/Bussiness'); 
const Tourist = require('../model/Tourist');   
const TourGuide = require('../model/TourGuide');
const generateToken = require("../utils/generateToken");
const setAuthCookie = require("../utils/setAuthCookie");



const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({email: email }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        if(user.role=='Admin'){

            const token = generateToken(user);
            setAuthCookie(res, token);
            return res.status(200).json({
                message: "Login successful",
                userDetails: {
                    userID: user.userID,
                    username: user.username,
                    role: user.role,
                    email: user.email,
                }
            });
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

             const token = generateToken(user);
             setAuthCookie(res, token);

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

            const token = generateToken(user);
            setAuthCookie(res, token);

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

            const token = generateToken(user);
            setAuthCookie(res, token);

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

const getCurrentUser = async (req, res) => {
    try {

        const user = await User.findOne({
            userID: req.user.userID
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                userID: user.userID,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        console.error("Get current user error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const logout = (req, res) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });

    return res.status(200).json({
        message: "Logout successful"
    });
};

module.exports = { login,getCurrentUser,logout };