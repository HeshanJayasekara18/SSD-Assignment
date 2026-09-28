const { OAuth2Client } = require('google-auth-library');
const User = require('../model/User');
const Tourist = require('../model/Tourist');
const generateToken = require('../utils/generateToken');
const setAuthCookie = require('../utils/setAuthCookie');

// Initialize Google OAuth2 client with Client ID from environment variables
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Handles Google OAuth login and registration specifically for Tourists.
 * 
 * Flow summary:
 * 1. Verifies the Google ID token sent from the frontend.
 * 2. Extracts user identity details (email, full name, sub).
 * 3. Match by googleSubject: Checks if a Google account is already linked.
 *    - If not found, fall back to matching by Email to safely link an existing account
 *      (requires email_verified === true from Google).
 * 4. Checks if user is registered as a 'Tourist'.
 * 5. Retrieves or creates linked Tourist profile without setting a password.
 * 6. Generates JWT and sets auth cookie.
 * 7. Returns standard userDetails and touristDetails to match the application's login response format.
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
        const sub = payload.sub;

        // Step 4: Check if the user already exists in our database by googleSubject
        let user = await User.findOne({ googleSubject: sub });
        let tourist = null;

        if (!user) {
            // Fallback: check if account exists by email to link it
            user = await User.findOne({ email });

            if (user) {
                // Require email_verified === true before linking
                if (!payload.email_verified) {
                    return res.status(403).json({
                        message: "Google email not verified. Cannot link to existing account."
                    });
                }

                // Link the account
                user.googleSubject = sub;
                await user.save();
            }
        }

        let isNewUser = false;
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
                tourist = await Tourist.create({
                    username: email,
                    fullname: fullname,
                    email: email,
                    userID: user.userID,
                    authProvider: 'google',
                    country: 'Not Specified'
                });
            }
        } else {
            // Step 5: New User Registration
            isNewUser = true;
            user = await User.create({
                username: email,
                role: 'Tourist',
                email: email,
                authProvider: 'google',
                googleSubject: sub
            });

            // Replicate standard registration: create linked Tourist profile with matching userID
            tourist = await Tourist.create({
                username: email,
                fullname: fullname,
                email: email,
                userID: user.userID,
                authProvider: 'google',
                country: 'Not Specified'
            });
        }

        // Step 6: Generate JWT and set Auth Cookie
        const jwtToken = generateToken(user);
        setAuthCookie(res, jwtToken);

        const isProfileComplete = Boolean(
            tourist.mobile_number && 
            tourist.country && 
            tourist.country !== 'Not Specified'
        );

        // Step 7: Return formatted response identical to standard LoginController
        return res.status(200).json({
            message: 'Google login successful',
            isNewUser,
            isProfileComplete,
            userDetails: {
                userID: user.userID,
                username: user.username,
                role: user.role,
                email: user.email,
            },
            touristDetails: {
                touristID: tourist.touristID,
                fullname: tourist.fullname,
                country: tourist.country || 'Not Specified',
                mobile_number: tourist.mobile_number || null,
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
