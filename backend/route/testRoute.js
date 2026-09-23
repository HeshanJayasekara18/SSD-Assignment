const express = require('express');
const router = express.Router();
const {
    testGetMethod,
    welcomeMsg
} = require('../controller/testController');

router.get('/test',testGetMethod);
router.post('/welcome',welcomeMsg);

// GET POST PUT DELETE

module.exports=router;