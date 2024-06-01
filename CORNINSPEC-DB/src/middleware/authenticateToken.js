// middleware/authenticateToken.js
const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT tokens.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @param {Function} next The next middleware function in the stack.
 */
function authenticateToken(req, res, next) {
    // Extract the token from the Authorization header.
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // Respond with a 401 status code if the token is not provided.
    if (token == null) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    // Verify the token.
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        // Respond with a 403 status code if the token is invalid or expired.
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        // Attach the decoded user to the request object and proceed to the next middleware.
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;