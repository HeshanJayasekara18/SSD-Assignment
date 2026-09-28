const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        {
            userID: user.userID,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: "1h",
            issuer: "ceylongo-api",
            audience: "ceylongo-client",
            subject: user.userID
        }
    );
};


module.exports = generateToken;