const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 3,

    standardHeaders: true,
    legacyHeaders: false,

    skipSuccessfulRequests: true,

    message: {
        message: "Too many login attempts. Please try again later."
    }
});

module.exports = {
    loginLimiter
};