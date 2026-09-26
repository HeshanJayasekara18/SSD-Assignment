const express = require('express');
const router = express.Router();
const {login,getCurrentUser,logout} = require('../controller/LoginController');

const {authenticateUser} = require("../middleware/auth");
   
router.post('/', login);
router.get("/me",authenticateUser,getCurrentUser);
router.post("/logout", logout);

module.exports = router;
