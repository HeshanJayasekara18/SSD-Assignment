const express = require('express');
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const {
    register,
    getBussinessDetails,
    loginBussiness
  } = require('../controller/BussinessRegisterController');

   
router.post('/', register); 
router.get('/',authenticateUser, getBussinessDetails);    
router.post('/login', loginBussiness);

module.exports = router;
