require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function migrate() {
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        logger.info('Starting database migration...');

        // Read SQL schema file
        const schemaFile = path.join(__dirname, '../models/sql/database.sql');
        const sql = fs.readFileSync(schemaFile, 'utf8');

        // Execute SQL
        await pool.query(sql);

        logger.info('Database migration completed successfully');
    } catch (error) {
        logger.error('Error during database migration:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run migrations if called directly
if (require.main === module) {
    migrate().catch(err => {
        logger.error('Migration failed:', err);
        process.exit(1);
    });
}

module.exports = migrate;