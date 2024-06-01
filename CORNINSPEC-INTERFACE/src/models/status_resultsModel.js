//src/models/status_resultsModel.js
const { interfacePool } = require('../config/dbconfig');

// CREATE
const createStatusResult = async (status, request_ref, insp_lot, operation, sample_no, userc1, userc2, usern1, usern2, userd1, usert1, equipment, funct_loc, msg) => {
    const result = await interfacePool.query(
        'INSERT INTO interface.status_results (status, request_ref, insp_lot, operation, sample_no, userc1, userc2, usern1, usern2, userd1, usert1, equipment, funct_loc, msg) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
        [status, request_ref, insp_lot, operation, sample_no, userc1, userc2, usern1, usern2, userd1, usert1, equipment, funct_loc, msg]
    );
    return result.rows[0];
};

// READ
const getStatusResults = async () => {
    const result = await interfacePool.query('SELECT * FROM interface.status_results');
    return result.rows;
};

// UPDATE
const updateStatusResult = async (id, status, request_ref, insp_lot, operation, sample_no, userc1, userc2, usern1, usern2, userd1, usert1, equipment, funct_loc, msg) => {
    const result = await interfacePool.query(
        'UPDATE interface.status_results SET status = $1, request_ref = $2, insp_lot = $3, operation = $4, sample_no = $5, userc1 = $6, userc2 = $7, usern1 = $8, usern2 = $9, userd1 = $10, usert1 = $11, equipment = $12, funct_loc = $13, msg = $14 WHERE id = $15 RETURNING *',
        [status, request_ref, insp_lot, operation, sample_no, userc1, userc2, usern1, usern2, userd1, usert1, equipment, funct_loc, msg, id]
    );
    return result.rows[0];
};

// DELETE
const deleteStatusResult = async (id) => {
    await interfacePool.query('DELETE FROM interface.status_results WHERE id = $1', [id]);
};

module.exports = {
    createStatusResult,
    getStatusResults,
    updateStatusResult,
    deleteStatusResult,
};