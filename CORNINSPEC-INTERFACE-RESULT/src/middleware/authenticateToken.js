// middleware/authenticateToken.js
require('dotenv').config();

function authenticateToken(req, res, next) {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ message: 'API Key is required.' });
    }

    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({ message: 'Invalid API Key.' });
    }

    next();
}

module.exports = { authenticateToken };

