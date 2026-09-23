const express = require('express');
const router = express.Router();
const feedbackController = require('../controller/feedbackController');


router.post('/', feedbackController.submitFeedback); // Create feedback
router.get('/', feedbackController.getAllFeedbacks); // Get all feedbacks
router.get('/:id', feedbackController.getFeedbackById); // Get single feedback by ID
router.put('/:id', feedbackController.updateFeedback); // Update feedback
router.delete('/:id', feedbackController.deleteFeedback); // Delete feedback
router.put('/:id/respond', feedbackController.respondToFeedback);// send response to feedback
router.get('/:id/response', feedbackController.getFeedbackResponse); // Get feedback by ID

module.exports = router;