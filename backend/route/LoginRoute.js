const express = require('express');
const router = express.Router();
const {
    login
  } = require('../controller/LoginController');

   
   
router.post('/', login);

module.exports = router;
