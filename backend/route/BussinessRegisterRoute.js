const express = require('express');
const router = express.Router();
const {
    register,
    getBussinessDetails,
    loginBussiness
  } = require('../controller/BussinessRegisterController');

   
router.post('/', register); 
router.get('/', getBussinessDetails);    
router.post('/login', loginBussiness);

module.exports = router;
