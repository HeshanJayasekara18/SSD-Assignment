// guideprofilecontroller.js
const GuideDetails = require('../model/GuideDetails');
const TourGuide = require('../model/TourGuide');
const TourGuideProfile = require('../model/GuideDetails');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

// Configure storage for profile images using memoryStorage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  },
}).single('profileImage');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalGuides = await GuideDetails.countDocuments();
    const stats = {
      totalGuides,
      activeGuides: Math.floor(totalGuides * 0.7), // Example calculation
      pendingGuides: Math.floor(totalGuides * 0.3), // Example calculation
      activeTrips: Math.floor(totalGuides * 2), // Example calculation
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
    });
  }
};

// Create a new tour guide profile
exports.createProfile = async (req, res) => {
  try {
    console.log('Full request body:', req.body);
    const {
      guideId,
      gender,
      phoneNumber,
      age,
      experience,
      languages,
      specializationList,
      bio,
      locations,
      description,
      amount,
    } = req.body;

    console.log('guideId:', guideId);
    const tourGuide = await TourGuide.findById(guideId);
    if (!tourGuide) {
      return res.status(404).json({ message: 'Tour guide not found for the provided guideId' });
    }
    

    const profile = new TourGuideProfile({
      guide: tourGuide._id,
      gender,
      phoneNumber,
      age,
      experience,
      languages: languages.split(','), // If passed as comma-separated
      specializationList: specializationList.split(','),
      bio,
      locations: locations.split(','),
      description,
      amount,
      profileImage: 
         {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          }
         // Only set profileImage if a file is uploaded
    });

    await profile.save();

    res.status(201).json({
      message: 'Tour guide profile added successfully',
      profile,
    });
  } catch (error) {
    console.error('Error saving tour guide profile:', error);
    res.status(500).json({
      message: 'Server Error',
      error: error.message,
    });
  }
};

// Get a tour guide profile by ID
exports.getProfileByGuideId = async (req, res) => {
  try {
    const { guideId } = req.params;

    console.log('guideId received:', guideId);

    const profile = await TourGuideProfile.findOne({ guide: guideId }).populate('guide');
    if (!profile) {
      return res.status(404).json({ message: 'Tour guide profile not found for the provided guideId' });
    }

    res.status(200).json({
      message: 'Tour guide profile retrieved successfully',
      profile: {
        ...profile.toObject(),
        profileImage: profile.profileImage
          ? `data:${profile.profileImage.contentType};base64,${profile.profileImage.data.toString('base64')}`
          : null,
      },
    });
  } catch (error) {
    console.error('Error fetching tour guide profile:', error);
    res.status(500).json({
      message: 'Server Error',
      error: error.message,
    });
  }
};

// Get all tour guide profiles
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await TourGuideProfile.find().populate('guide');
    res.status(200).json({
      message: 'All tour guide profiles retrieved successfully',
      profiles,
    });
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    res.status(500).json({
      message: 'Server Error',
      error: error.message,
    });
  }
};

// Update a tour guide profile by guideId
exports.updateProfile = async (req, res) => {
  try {
    const { guideId } = req.params;
    const updatedData = req.body;

    if (updatedData.languages) {
      updatedData.languages = updatedData.languages.split(',');
    }

    if (updatedData.specializationList) {
      updatedData.specializationList = updatedData.specializationList.split(',');
    }

    if (updatedData.locations) {
      updatedData.locations = updatedData.locations.split(',');
    }

    if (req.file) {
      updatedData.profileImage = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const updatedProfile = await TourGuideProfile.findOneAndUpdate(
      { guide: guideId },
      updatedData,
      { new: true }
    ).populate('guide');

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found to update' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      message: 'Server Error',
      error: error.message,
    });
  }
};

// Delete a tour guide profile by guideId
exports.deleteProfile = async (req, res) => {
  try {
    const { guideId } = req.params;

    const deletedProfile = await TourGuideProfile.findOneAndDelete({ guide: guideId });

    if (!deletedProfile) {
      return res.status(404).json({ message: 'Profile not found to delete' });
    }

    res.status(200).json({
      message: 'Profile deleted successfully',
      deletedProfile,
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      message: 'Server Error',
      error: error.message,
    });
  }
};