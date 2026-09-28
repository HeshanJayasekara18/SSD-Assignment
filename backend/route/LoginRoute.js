const express = require('express');
const router = express.Router();
const {login,getCurrentUser,logout} = require('../controller/LoginController');

const {authenticateUser} = require("../middleware/auth");
const { loginLimiter } = require("../middleware/rateLimiter");
   
router.post('/',loginLimiter, login);
router.get("/me",authenticateUser,getCurrentUser);
router.post("/logout", logout);

module.exports = router;
