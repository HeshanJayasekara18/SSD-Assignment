const jwt = require('jsonwebtoken'); // Make sure you install jsonwebtoken package

// Middleware to check if the user is authenticated
const authenticateUser = (req, res, next) => {
    const token = req.headers['authorization']; // Get token from the request headers
    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Attach the decoded user info to the request
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

// Middleware to check user role dynamically
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied, insufficient permissions' });
        }
        next();
    };
};

module.exports = { authenticateUser, authorize };
