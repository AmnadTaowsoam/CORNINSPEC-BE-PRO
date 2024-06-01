//src/models/tokenModel.js
const { interfacePool } = require('../config/dbconfig');

// CREATE
const createToken = async (token) => {
    const result = await interfacePool.query(
        'INSERT INTO interface.tokens (token) VALUES ($1) RETURNING *',
        [token]
    );
    return result.rows[0];
};

// READ
const getTokens = async () => {
    const result = await interfacePool.query('SELECT * FROM interface.tokens');
    return result.rows;
};

// UPDATE
const updateToken = async (id, token) => {
    const result = await interfacePool.query(
        'UPDATE interface.tokens SET token = $1 WHERE id = $2 RETURNING *',
        [token, id]
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
    updateToken,
    deleteToken,
};
