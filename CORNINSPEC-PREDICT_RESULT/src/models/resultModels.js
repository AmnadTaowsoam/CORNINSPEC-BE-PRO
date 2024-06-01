const { predictionPool } = require('../config/dbconfig');// Import the shared pool

async function createResult(value) {
    const { rows } = await predictionPool.query('INSERT INTO result(value, created_at) VALUES($1, NOW()) RETURNING *', [value]);
    return rows[0];
}

async function getResultById(id) {
    const { rows } = await predictionPool.query('SELECT * FROM result WHERE id = $1', [id]);
    return rows[0];
}

async function getAllResults() {
    const { rows } = await predictionPool.query('SELECT * FROM result ORDER BY created_at DESC');
    return rows;
}

async function updateResult(id, newValue) {
    const { rows } = await predictionPool.query('UPDATE result SET value = $1 WHERE id = $2 RETURNING *', [newValue, id]);
    return rows[0];
}

async function deleteResult(id) {
    await predictionPool.query('DELETE FROM result WHERE id = $1', [id]);
}

async function getResultsByCriteria(inslot, batch, material, plant, operationno) {
  const query = `
      SELECT * FROM prediction.result
      WHERE inslot = $1 AND batch = $2 AND material = $3 AND plant = $4 AND operationno = $5;
  `;
  const values = [inslot, batch, material, plant, operationno];
  const { rows } = await predictionPool.query(query, values);
  return rows;
}

module.exports = {
    createResult,
    getResultById,
    getAllResults,
    updateResult,
    deleteResult,
    getResultsByCriteria
};
