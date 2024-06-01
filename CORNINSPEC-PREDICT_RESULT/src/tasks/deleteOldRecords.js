const cron = require('node-cron');
const pool = require('../config/dbconfig');  // Ensure this path points to your dbconfig

const scheduleDeleteOldRecords = () => {
    cron.schedule('0 0 * * *', async () => {  // This sets the task to run at midnight every day
        console.log('Running a daily task to clean up old records from result and interface tables');
        
        // Delete old records from the 'result' table
        const deleteResultQuery = `
            DELETE FROM prediction.result
            WHERE created_at < NOW() - INTERVAL '3 months';
        `;

        // Delete old records from the 'interface' table
        const deleteInterfaceQuery = `
            DELETE FROM prediction.interface
            WHERE created_at < NOW() - INTERVAL '3 months';
        `;

        try {
            // Execute deletion for 'result' table
            const result = await pool.query(deleteResultQuery);
            console.log(`Result table: ${result.rowCount} records deleted`);

            // Execute deletion for 'interface' table
            const interfaceResult = await pool.query(deleteInterfaceQuery);
            console.log(`Interface table: ${interfaceResult.rowCount} records deleted`);
        } catch (err) {
            console.error('Error deleting old records:', err);
        }
    });
};

module.exports = scheduleDeleteOldRecords;
