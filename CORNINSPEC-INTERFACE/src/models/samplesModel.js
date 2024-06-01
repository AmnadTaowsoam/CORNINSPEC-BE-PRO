//src/models/sampleModel.js
const { interfacePool } = require('../config/dbconfig');

// CREATE
const createSample = async (insp_lot, operation, sample_no, status, message) => {
    const result = await interfacePool.query(
        'INSERT INTO interface.samples (insp_lot, operation, sample_no, status, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [insp_lot, operation, sample_no, status, message]
    );
    return result.rows[0];
};

// READ
const getSamples = async () => {
    const result = await interfacePool.query('SELECT * FROM interface.samples');
    return result.rows;
};

// UPDATE
const updateSample = async (id, insp_lot, operation, sample_no, status, message) => {
    const result = await interfacePool.query(
        'UPDATE interface.samples SET insp_lot = $1, operation = $2, sample_no = $3, status = $4, message = $5 WHERE id = $6 RETURNING *',
        [insp_lot, operation, sample_no, status, message, id]
    );
    return result.rows[0];
};

// DELETE
const deleteSample = async (id) => {
    await interfacePool.query('DELETE FROM interface.samples WHERE id = $1', [id]);
};

module.exports = {
    createSample,
    getSamples,
    updateSample,
    deleteSample,
};