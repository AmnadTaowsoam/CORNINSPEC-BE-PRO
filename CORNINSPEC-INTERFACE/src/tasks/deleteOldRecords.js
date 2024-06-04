const { interfacePool } = require('../config/dbconfig');

async function deleteOldRecords() {
    const client = await interfacePool.connect();

    try {
        const deleteQueries = [
            `DELETE FROM interface.interface_requests WHERE created_at < NOW() - INTERVAL '90 days'`,
            `DELETE FROM interface.tokens WHERE created_at < NOW() - INTERVAL '90 days'`,
            `DELETE FROM interface.samples WHERE created_at < NOW() - INTERVAL '90 days'`,
            `DELETE FROM interface.inspections WHERE created_at < NOW() - INTERVAL '90 days'`
        ];

        for (const query of deleteQueries) {
            const result = await client.query(query);
            console.log(`Deleted ${result.rowCount} records from query: ${query}`);
        }
    } catch (error) {
        console.error('Error deleting old records:', error.message);
    } finally {
        client.release();
    }
}

module.exports = deleteOldRecords;
