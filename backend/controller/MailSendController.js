const express = require('express');
const dotenv = require("dotenv");
const transporter = require('../utils/Mailer');
dotenv.config();

const sendMail = async (req, res) => {
  const { email, paymentId, amount } = req.body;

  const subject = "Payment Successful!";

  // Plain text version (no indentation)
  const text = 
`Dear Customer,

Thank you for your payment!

Here are your payment details:
- Payment ID: ${paymentId}
- Amount Paid: $${amount}

Your booking has been successfully confirmed.

If you have any questions, feel free to contact our support team.

Best regards,  
CeylonGo`;

  // HTML version (for better formatting in email clients)
  const html = `
    <p>Dear Customer,</p>
    <p>Thank you for your payment!</p>
    <p><strong>Here are your payment details:</strong><br>
    Payment ID: <strong>${paymentId}</strong><br>
    Amount Paid: <strong>$${amount}</strong></p>
    <p>Your booking has been successfully confirmed.</p>
    <p>If you have any questions, feel free to contact our support team.</p>
    <p>Best regards,<br><strong>CeylonGo</strong></p>
  `;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject,
    text, // fallback for plain-text-only clients
    html  // preferred for better formatting
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};

const sendRegistrationMail = async (req, res) => {
  const email=req.query.email;

  const subject = "Welcome to CeylonGo!";

  // Plain text version
  const text = 
      `Dear Customer,

      Welcome to CeylonGo!

      Your account has been successfully registered. We're excited to have you on board.

      Start exploring hotels, safaris, vehicle rentals, and more with ease.

      If you have any questions or need assistance, feel free to contact our support team.

      Best regards,  
      CeylonGo`;

  // HTML version
  const html = `
    <p>Dear Customer,</p>
    <p><strong>Welcome to CeylonGo!</strong></p>
    <p>Your account has been successfully registered. We're excited to have you on board.</p>
    <p>Start exploring hotels, safaris, vehicle rentals, and more with ease.</p>
    <p>If you have any questions or need assistance, feel free to contact our support team.</p>
    <p>Best regards,<br><strong>CeylonGo</strong></p>
  `;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Registration email sent:", info.response);
    res.status(200).json({ message: 'Registration email sent' });
  } catch (error) {
    console.error('Error sending registration email:', error);
    res.status(500).json({ message: 'Error sending registration email', error: error.message });
  }
};

module.exports = { sendMail,sendRegistrationMail };