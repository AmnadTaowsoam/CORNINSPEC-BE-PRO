const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { findUserByUsername } = require('../models/userModel');
const { createRefreshToken, getRefreshToken, deleteRefreshToken } = require('../models/refreshTokenModel');

const router = express.Router();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET; // Ensure this is set in your .env file
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET; // Ensure this is also set

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    console.error('Error: ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set');
    process.exit(1);
}

// Function to generate access token
const generateAccessToken = (userId, username, role) => {
    return jwt.sign({ userId, username, role }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

// Function to generate refresh token
const generateRefreshToken = async (userId) => {
    const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    await createRefreshToken(userId, refreshToken, expiresAt);
    return refreshToken;
};

// Validate login input
const validateLogin = [
    body('username').not().isEmpty().withMessage('Username is required'),
    body('password').not().isEmpty().withMessage('Password is required')
];

router.post('/login', validateLogin, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const user = await findUserByUsername(username);
    if (user && await bcrypt.compare(password, user.pwd)) {
        const accessToken = generateAccessToken(user.user_id, user.username, user.roles); 
        const refreshToken = await generateRefreshToken(user.user_id);

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV !== 'development', path: '/api/auth/refreshToken' });
        return res.json({ 
            accessToken, 
            refreshToken, 
            roles: user.roles
        });
    } else {
        return res.status(401).json({ message: 'Username or password is incorrect' });
    }
}));

router.post('/refreshToken', asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies; // Assuming refreshToken is sent in cookies
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is required' });
    }

    let payload;
    try {
        payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (error) {
        return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const tokenData = await getRefreshToken(refreshToken);
    if (!tokenData || new Date(tokenData.expires_at) < new Date()) {
        return res.status(403).json({ message: 'Expired refresh token' });
    }

    // Optionally delete the old refresh token from the database
    // await deleteRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken(payload.userId, tokenData.username);
    // Optionally create a new refresh token here as well
    // const newRefreshToken = await generateRefreshToken(payload.userId);

    res.json({ accessToken: newAccessToken /*, refreshToken: newRefreshToken */ });
}));

router.post('/logout', asyncHandler(async (req, res) => {
    // Try to get refreshToken from cookies first, then fallback to request body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Your existing logic for checking refreshToken in the database and deleting it
    const tokenData = await getRefreshToken(refreshToken);
    if (!tokenData) {
        // If refreshToken is not found in the database, consider it as already logged out
        return res.status(200).json({ message: 'Logged out successfully or token was invalid' });
    }

    // If refreshToken is found, delete it from the database
    await deleteRefreshToken(refreshToken);

    // Optionally, clear the refreshToken cookie
    res.cookie('refreshToken', '', { maxAge: 0, path: '/api/auth/refreshToken' });

    return res.status(200).json({ message: 'Logged out successfully' });
}));

module.exports = router;
