const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Adjust the path as necessary based on actual file structure

/**
 * Fetches database configuration from environment variables using a specified prefix.
 * @param {string} prefix The prefix for the environment variables (e.g., 'USERS').
 * @returns {Object} Database configuration object.
 */
function getDbConfig(prefix) {
    const keys = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
    const envVars = keys.map(key => `${prefix}_${key}`);
    const config = {};

    const missingVars = envVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        console.error(`Environment variables: ${JSON.stringify(process.env, null, 2)}`);
        throw new Error(`Database configuration error: Missing environment variables [${missingVars.join(', ')}] for the ${prefix} database.`);
    }

    config.host = process.env[`${prefix}_DB_HOST`];
    config.user = process.env[`${prefix}_DB_USERNAME`];
    config.password = process.env[`${prefix}_DB_PASSWORD`];
    config.database = process.env[`${prefix}_DB_NAME`];
    config.port = parseInt(process.env[`${prefix}_DB_PORT`], 10);

    return config;
}

// Create database pools for different databases if necessary
const usersPool = new Pool(getDbConfig('USERS'));
const predictionPool = new Pool(getDbConfig('PREDICT'));
const interfacePool = new Pool(getDbConfig('INTERFACE'));

module.exports = { usersPool, predictionPool, interfacePool };


