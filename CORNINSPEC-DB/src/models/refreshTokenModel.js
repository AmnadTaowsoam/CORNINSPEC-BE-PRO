const { usersPool } = require('../config/dbConfig');

// ฟังก์ชันสำหรับดึง refreshToken จากฐานข้อมูล
const getRefreshToken = async (token) => {
    try {
        const result = await usersPool.query('SELECT * FROM users.refresh_tokens WHERE token = $1', [token]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error retrieving refresh token:', error);
        throw error;
    }
};

// Improved async/await error handling using try-catch blocks
const createRefreshToken = async (userId, token, expiresAt) => {
    try {
        await usersPool.query(
            'INSERT INTO users.refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [userId, token, expiresAt]
        );
    } catch (error) {
        console.error('Error creating refresh token:', error);
        throw new Error('Failed to create refresh token');
    }
};

const findRefreshToken = async (token) => {
    try {
        const result = await usersPool.query(
            'SELECT * FROM users.refresh_tokens WHERE token = $1',
            [token]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error finding refresh token:', error);
        throw new Error('Failed to find refresh token');
    }
};

const updateRefreshToken = async (token, newToken, newExpiresAt) => {
    try {
        const result = await usersPool.query(
            'UPDATE users.refresh_tokens SET token = $1, expires_at = $2 WHERE token = $3 RETURNING *',
            [newToken, newExpiresAt, token]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error updating refresh token:', error);
        throw new Error('Failed to update refresh token');
    }
};

const deleteRefreshToken = async (token) => {
    try {
        const result = await usersPool.query(
            'DELETE FROM users.refresh_tokens WHERE token = $1',
            [token]
        );
        return result.rowCount > 0;
    } catch (error) {
        console.error('Error deleting refresh token:', error);
        throw new Error('Failed to delete refresh token');
    }
};

module.exports = {
    getRefreshToken,
    createRefreshToken,
    findRefreshToken,
    updateRefreshToken,
    deleteRefreshToken
};