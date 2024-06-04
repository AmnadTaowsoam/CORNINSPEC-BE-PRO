const { interfacePool } = require('../config/dbconfig');

// CREATE
const createToken = async (token, cookies) => {
    const result = await interfacePool.query(
        'INSERT INTO interface.tokens (token, cookies) VALUES ($1, $2) RETURNING *',
        [token, cookies]
    );
    return result.rows[0];
};

// READ
const getTokens = async () => {
    const result = await interfacePool.query('SELECT * FROM interface.tokens');
    return result.rows;
};

// READ latest token and cookies
const getLatestTokenAndCookies = async () => {
    const result = await interfacePool.query(
        'SELECT token, cookies FROM interface.tokens ORDER BY created_at DESC LIMIT 1'
    );
    return result.rows[0];
};

// UPDATE
const updateToken = async (id, token, cookies) => {
    const result = await interfacePool.query(
        'UPDATE interface.tokens SET token = $1, cookies = $2 WHERE id = $3 RETURNING *',
        [token, cookies, id]
    );
    return result.rows[0];
};

// DELETE
const deleteToken = async (id) => {
    await interfacePool.query('DELETE FROM interface.tokens WHERE id = $1', [id]);
};

module.exports = {
    createToken,
    getTokens,
    getLatestTokenAndCookies,
    updateToken,
    deleteToken,
};
