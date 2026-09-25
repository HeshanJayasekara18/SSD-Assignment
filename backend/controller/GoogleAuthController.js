const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const User = require('../model/User');
const Tourist = require('../model/Tourist');

// Initialize Google OAuth2 client with Client ID from environment variables
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Handles Google OAuth login and registration specifically for Tourists.
 * 
 * Flow summary:
 * 1. Verifies the Google ID token sent from the frontend.
 * 2. Extracts user identity details (email, full name).
 * 3. Match by Email: Checks if an account already exists with this email.
 *    - If user exists: validates role is 'Tourist' and retrieves the linked Tourist profile.
 *    - If new user: generates a secure dummy password to satisfy User schema validation,
 *      then registers both the User and Tourist profile simultaneously (mirroring TouristRegisterController).
 * 4. Returns standard userDetails and touristDetails to match the application's login response format.
 * 
 * @param {Object} req - Express request object containing `token` in body
 * @param {Object} res - Express response object
 */
const googleTouristAuth = async (req, res) => {
    try {
        const { token } = req.body;

        // Step 1: Validate input presence
        if (!token) {
            return res.status(400).json({ message: 'No Google token provided' });
        }

        // Step 2: Cryptographically verify the Google ID token against Google's servers
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        // Step 3: Extract profile information from the verified payload
        const payload = ticket.getPayload();
        const email = payload.email;
        const fullname = payload.name || payload.given_name || email.split('@')[0];

        // Step 4: Check if the user already exists in our database by email
        let user = await User.findOne({ email });
        let tourist = null;

        if (user) {
            // Existing User: Verify that this account is registered as a Tourist
            if (user.role !== 'Tourist') {
                return res.status(400).json({ 
                    message: `Email is already registered as a ${user.role}. Please log in with that role.` 
                });
            }

            // Retrieve the linked Tourist profile using the unique userID
            tourist = await Tourist.findOne({ userID: user.userID });

            // Self-healing fallback: If Tourist profile is missing for any reason, create it
            if (!tourist) {
                const dummyPassword = crypto.randomBytes(16).toString('hex');
                tourist = await Tourist.create({
                    username: email,
                    fullname: fullname,
                    email: email,
                    country: 'Not Specified',
                    mobile_number: 0,
                    password: dummyPassword,
                    userID: user.userID
                });
            }
        } else {
            // Step 5: New User Registration
            // Since MongoDB User model requires a password, generate a secure random dummy password.
            // OAuth users sign in via Google and won't need to enter this password manually.
            const dummyPassword = crypto.randomBytes(16).toString('hex');

            // Replicate standard registration: create base User record
            user = await User.create({
                username: email,
                password: dummyPassword,
                role: 'Tourist',
                email: email
            });

            // Replicate standard registration: create linked Tourist profile with matching userID
            tourist = await Tourist.create({
                username: email,
                fullname: fullname,
                email: email,
                country: 'Not Specified',
                mobile_number: 0,
                password: dummyPassword,
                userID: user.userID
            });
        }

        // Step 6: Return formatted response identical to standard LoginController
        return res.status(200).json({
            message: 'Google login successful',
            userDetails: {
                userID: user.userID,
                username: user.username,
                role: user.role,
                email: user.email,
            },
            touristDetails: {
                touristID: tourist.touristID,
                fullname: tourist.fullname,
                country: tourist.country,
                mobile_number: tourist.mobile_number,
            }
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        return res.status(500).json({ 
            message: 'Google authentication failed', 
            error: error.message 
        });
    }
};

module.exports = { googleTouristAuth };

