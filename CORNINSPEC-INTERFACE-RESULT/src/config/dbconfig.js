//src/config/dbconfig.js
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); 

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
    config.port = parseInt(process.env[`${prefix}_CONNECT_DB_PORT`]);

    return config;
}

const statusResultPool = new Pool(getDbConfig('STATUS_RESULTS'));

module.exports = { statusResultPool };