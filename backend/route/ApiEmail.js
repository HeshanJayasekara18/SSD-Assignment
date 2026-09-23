// In your API routes file (e.g., routes/api.js)
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Use your preferred email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// API endpoint for sending emails
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text, html, attachments } = req.body;
    
    if (!to || !subject) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required email fields' 
      });
    }
    
    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to,
      subject,
      text,
      html
    };
    
    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments.map(attachment => {
        // Check if file exists before attempting to attach
        const filePath = attachment.path;
        if (fs.existsSync(filePath)) {
          return attachment;
        }
        return null;
      }).filter(Boolean);
    }
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

module.exports = router;

// In your main server file (e.g., server.js or app.js)
// Make sure to include the routes
// app.use('/api', require('./routes/api'));

// Don't forget to install nodemailer
// npm install nodemailer --save