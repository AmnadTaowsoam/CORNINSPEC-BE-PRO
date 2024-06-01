// routes/authRoutes.js
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const cookieParser = require('cookie-parser');

const router = express.Router();
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

router.use(cookieParser());

// Function to generate access token
const generateAccessToken = (apiKey) => {
    return jwt.sign({ apiKey }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

// Function to generate refresh token
const generateRefreshToken = (apiKey) => {
    return jwt.sign({ apiKey }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// Validate login input
const validateLogin = [
    body('apiKey').not().isEmpty().withMessage('API Key is required'),
    body('apiSecret').not().isEmpty().withMessage('API Secret is required')
];

router.post('/login', validateLogin, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { apiKey, apiSecret } = req.body;
    if (apiKey === API_KEY && apiSecret === API_SECRET) {
        const accessToken = generateAccessToken(apiKey);
        const refreshToken = generateRefreshToken(apiKey);

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV !== 'development', path: '/api/auth/refreshToken' });
        return res.json({ accessToken, refreshToken });
    } else {
        return res.status(401).json({ message: 'Invalid API Key or Secret' });
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

    const newAccessToken = generateAccessToken(payload.apiKey);

    res.json({ accessToken: newAccessToken });
}));

module.exports = router;
