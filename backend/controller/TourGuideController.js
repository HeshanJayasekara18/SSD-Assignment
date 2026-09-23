const TourGuide = require('../model/TourGuide');
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerTourGuide = async (req, res) => {
  const { guideName, email, password, role } = req.body;
  console.log('Registering tour guide:', { guideName, email, password, role });

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password before saving
    //const hashedPassword = await bcrypt.hash(password, 10);

    // Step 1: Create and save User
    const newUser = new User({
      username: email, // Username equals email
      password: password,   
      role,
      email,
    });

    console.log(newUser);
    
    
    if(!newUser){
  
      return res.status(400).json({ message: 'User not created' });
    }

    const savedUser = await newUser.save();

    // Step 2: Create and save TourGuide
    const newTourGuide = new TourGuide({
      guideName,
      user: savedUser._id
    });

    const savedGuide = await newTourGuide.save();

    return res.status(201).json({
      message: 'Tour guide registered successfully',
      tourGuide: savedGuide,
      user: savedUser
    });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      message: 'Server error during registration',
      error: err.message
    });
  }
};


exports.loginTourGuide = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find the tour guide by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    
    
    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const tourGuide = await TourGuide.findOne({ user: user._id });
    if (!tourGuide) {
      return res.status(404).json({ message: 'Tour guide details not found' });
    }

    // Create and return JWT token
    const token = jwt.sign({ id: tourGuide._id }, 'your_jwt_secret', { expiresIn: '1d' });
        
    res.status(200).json({
      message: 'Login successful',
      token,
      guideId: tourGuide._id,
      guideName: tourGuide.guideName
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
}
// Add to TourGuideController.js

// Get all tour guides
exports.getAllTourGuides = async (req, res) => {
  try {
    const tourGuides = await TourGuide.find()
      .populate('user', 'email role')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: tourGuides.length,
      data: tourGuides
    });
  } catch (err) {
    console.error('Error fetching tour guides:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching tour guides', 
      error: err.message 
    });
  }
};

// Delete a tour guide
exports.deleteTourGuide = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the tour guide
    const tourGuide = await TourGuide.findById(id);
    
    if (!tourGuide) {
      return res.status(404).json({
        success: false,
        message: 'Tour guide not found'
      });
    }
    
    // Get the user ID associated with this tour guide
    const userId = tourGuide.user;
    
    // Delete the tour guide
    await TourGuide.findByIdAndDelete(id);
    
    // Delete the associated user
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({
      success: true,
      message: 'Tour guide deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting tour guide:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting tour guide',
      error: err.message
    });
  }
};
