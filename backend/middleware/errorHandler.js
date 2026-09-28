/**
 * Centralized Error Handling Middleware (CWE-209 Mitigation)
 * Prevents internal database schemas, stack traces, and library errors
 * from leaking to client responses.
 */

const errorHandler = (err, req, res, next) => {
    // Log complete error securely to server console/logger for debugging
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

    // Mongoose CastError (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Invalid identifier provided for ${err.path || 'resource'}`
        });
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum allowed size is 5MB.'
        });
    }

    if (err.message && err.message.startsWith('INVALID_FILE_TYPE')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // Default Generic Safe 500 Response (never leak raw error.message in production)
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: 'An unexpected internal server error occurred. Please try again later.'
    });
};

module.exports = errorHandler;
