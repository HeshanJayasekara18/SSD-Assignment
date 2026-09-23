const express = require('express');
const router = express.Router();
const {
    sendMail,
    sendRegistrationMail
} = require('../controller/MailSendController');
  
router.post('/',sendMail);  
router.post('/registerMail',sendRegistrationMail); 

module.exports = router;
