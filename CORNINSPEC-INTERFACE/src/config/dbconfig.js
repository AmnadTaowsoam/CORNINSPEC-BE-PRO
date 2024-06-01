//src/config/dbconfig.js
const { Pool } = require('pg');
require('dotenv').config(); // Ensure the .env file is loaded

function getDbConfig(prefix) {
    const keys = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
    const envVars = keys.map(key => `${prefix}_${key}`);
    const config = {};

    const missingVars = envVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        console.error(`Missing environment variables: [${missingVars.join(', ')}] for the ${prefix} database.`);
        throw new Error(`Database configuration error`);
    }

    config.host = process.env[`${prefix}_DB_HOST`];
    config.user = process.env[`${prefix}_DB_USERNAME`];
    config.password = process.env[`${prefix}_DB_PASSWORD`];
    config.database = process.env[`${prefix}_DB_NAME`];
    config.port = parseInt(process.env['INTERFACE_CONNECT_DB_PORT']);

    return config;
}

const interfacePool = new Pool(getDbConfig('INTERFACE'));

module.exports = { interfacePool };