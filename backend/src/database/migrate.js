const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

async function migrate() {
    try {
        const schemaFile = await fs.readFile(
            path.join(__dirname, 'schema.sql'),
            'utf8'
        );

        await pool.query(schemaFile);
        logger.info('Database migration completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();