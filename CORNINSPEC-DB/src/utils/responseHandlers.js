// utils/responseHandlers.js
function sendSuccess(res, data, statusCode = 200) {
    res.status(statusCode).json(data);
}

function sendError(res, message, statusCode = 500) {
    res.status(statusCode).json({ message });
}

module.exports = { sendSuccess, sendError };