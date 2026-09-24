const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const User = require('../model/User');
const Tourist = require('../model/Tourist');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleTouristAuth = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'No Google token provided' });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const email = payload.email;
        const fullname = payload.name || payload.given_name || email.split('@')[0];

        let user = await User.findOne({ email });
        let tourist = null;

        if (user) {
            if (user.role !== 'Tourist') {
                return res.status(400).json({ 
                    message: \Email is already registered as a \. Please log in with that role.\ 
                });
            }

            tourist = await Tourist.findOne({ userID: user.userID });
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
            const dummyPassword = crypto.randomBytes(16).toString('hex');

            user = await User.create({
                username: email,
                password: dummyPassword,
                role: 'Tourist',
                email: email
            });

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
