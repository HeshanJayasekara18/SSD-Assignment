const express = require('express');
const router = express.Router();
const { googleTouristAuth } = require('../controller/GoogleAuthController');

router.post('/tourist', googleTouristAuth);

module.exports = router;
