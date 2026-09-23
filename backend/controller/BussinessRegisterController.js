const User = require('../model/User');
const Bussiness = require('../model/Bussiness'); 
const BussinessAgent = require('../model/BussinessAgent');


const register = async (req, res) => {
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered. Please use a different email." });
        }

        // Create User
        const user = await User.create({          
            username: req.body.email,
            password: req.body.password, 
            role: req.body.role,
            email: req.body.email
        });

        // Create Business Agent
        const businessAgent = await BussinessAgent.create({
            fullname: req.body.fullName, // Corrected property name
            userAddress: req.body.userAddress, // Mapped correctly from frontend
            contact: req.body.contact,
            userID: user.userID // Use MongoDB's default _id
        });

        // Create Business
        const business = await Bussiness.create({
            BA_Id: businessAgent.BA_Id, // Corrected reference
            businessName: req.body.businessName,
            businessAddress: req.body.businessAddress,
            description: req.body.description,
            bussinessType: req.body.businessType, // Fixed spelling
            businessFile: req.body.businessFile // Ensure file upload handling
        });

        res.status(201).json({ 
            message: "User, Business Agent, and Business created successfully", 
            user, 
            businessAgent, 
            business 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getBussinessDetails = async (req, res) => {
    try {
        const { B_Id } = req.query;      

        const business = await Bussiness.findOne({ B_Id: B_Id });

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        const businessAgent = await BussinessAgent.findOne({ BA_Id: business.BA_Id });

        if (!businessAgent) {
            return res.status(404).json({ message: "Business Agent not found" });
        }

        const user = await User.findOne({ userID : businessAgent.userID });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Business details retrieved successfully",
            user,
            businessAgent,
            business
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginBussiness = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check if the password is correct
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.status(200).json({ message: "Login successful", user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, getBussinessDetails ,loginBussiness};

