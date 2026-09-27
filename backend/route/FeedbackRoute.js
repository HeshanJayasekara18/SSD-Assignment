const express = require('express');
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const feedbackController = require('../controller/feedbackController');


router.post('/', authenticateUser,feedbackController.submitFeedback); // Create feedback
router.get('/', authenticateUser,feedbackController.getAllFeedbacks); // Get all feedbacks
router.get('/:id',authenticateUser, feedbackController.getFeedbackById); // Get single feedback by ID
router.put('/:id', authenticateUser,feedbackController.updateFeedback); // Update feedback
router.delete('/:id',authenticateUser, feedbackController.deleteFeedback); // Delete feedback
router.put('/:id/respond', authenticateUser,feedbackController.respondToFeedback);// send response to feedback
router.get('/:id/response',authenticateUser, feedbackController.getFeedbackResponse); // Get feedback by ID

module.exports = router;