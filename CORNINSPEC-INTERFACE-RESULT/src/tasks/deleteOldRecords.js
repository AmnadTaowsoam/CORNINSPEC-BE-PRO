const { statusResultPool } = require('../config/dbconfig'); // นำเข้า statusResultPool จาก dbconfig.js

async function deleteOldRecords() {
    const client = await statusResultPool.connect();

    try {
        const deleteQuery = `
            DELETE FROM status.status_results
            WHERE created_at < NOW() - INTERVAL '90 days';
        `;
        const result = await client.query(deleteQuery);

        console.log(`Deleted ${result.rowCount} records older than 90 days.`);
    } catch (error) {
        console.error('Error deleting old records:', error.message);
    } finally {
        client.release();
    }
}

module.exports = deleteOldRecords;
