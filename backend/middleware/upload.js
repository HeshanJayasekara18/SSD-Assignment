const multer = require("multer");
const path = require("path");

// Memory storage for file buffers
const storage = multer.memoryStorage();

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Strict MIME and extension validation
    if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("INVALID_FILE_TYPE: Only JPEG, PNG, and WebP images are allowed."), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit to prevent Memory Exhaustion / DoS
        files: 1
    },
    fileFilter: fileFilter
});

module.exports = upload;
