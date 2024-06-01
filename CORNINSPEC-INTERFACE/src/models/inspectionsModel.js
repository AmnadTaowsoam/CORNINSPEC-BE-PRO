//src/models/inspectionsModel.js
const { interfacePool } = require('../config/dbconfig');

// CREATE
const createInspection = async (request_ref, insp_lot, plant, operation, sample_no, phys003, phys004, phys005, phys006, phys007, phys008, phys009, status, message) => {
    const result = await interfacePool.query(
        'INSERT INTO interface.inspections (request_ref, insp_lot, plant, operation, sample_no, phys003, phys004, phys005, phys006, phys007, phys008, phys009, status, message) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
        [request_ref, insp_lot, plant, operation, sample_no, phys003, phys004, phys005, phys006, phys007, phys008, phys009, status, message]
    );
    return result.rows[0];
};

// READ
const getInspections = async () => {
    const result = await interfacePool.query('SELECT * FROM interface.inspections');
    return result.rows;
};

// UPDATE
const updateInspection = async (id, request_ref, insp_lot, plant, operation, sample_no, phys003, phys004, phys005, phys006, phys007, phys008, phys009, status, message) => {
    const result = await interfacePool.query(
        'UPDATE interface.inspections SET request_ref = $1, insp_lot = $2, plant = $3, operation = $4, sample_no = $5, phys003 = $6, phys004 = $7, phys005 = $8, phys006 = $9, phys007 = $10, phys008 = $11, phys009 = $12, status = $13, message = $14 WHERE id = $15 RETURNING *',
        [request_ref, insp_lot, plant, operation, sample_no, phys003, phys004, phys005, phys006, phys007, phys008, phys009, status, message, id]
    );
    return result.rows[0];
};

// DELETE
const deleteInspection = async (id) => {
    await interfacePool.query('DELETE FROM interface.inspections WHERE id = $1', [id]);
};

module.exports = {
    createInspection,
    getInspections,
    updateInspection,
    deleteInspection,
};