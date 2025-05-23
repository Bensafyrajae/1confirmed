require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

async function seed() {
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const client = await pool.connect();

    try {
        logger.info('Starting database seeding...');

        await client.query('BEGIN');

        // Insert demo user
        const hashedPassword = await bcrypt.hash('Password123', 10);
        const userResult = await client.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, company_name)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            ['demo@example.com', hashedPassword, 'Demo', 'User', 'Demo Company']
        );

        const userId = userResult.rows[0].id;

        // Insert sample templates
        const templates = [
            {
                name: 'Birthday Reminder',
                content: 'Hi {{name}}, this is a reminder for {{event}} on {{date}}. We hope to see you there!'
            },
            {
                name: 'Meeting Reminder',
                content: 'Hello {{name}}, don\'t forget your meeting "{{event}}" scheduled for {{date}} at {{location}}.'
            },
            {
                name: 'Event Confirmation',
                content: 'Dear {{name}}, your attendance at {{event}} on {{date}} has been confirmed. Details: {{description}}'
            }
        ];

        for (const template of templates) {
            await client.query(
                `INSERT INTO templates (user_id, name, content)
                 VALUES ($1, $2, $3)`,
                [userId, template.name, template.content]
            );
        }

        // Insert sample recipients
        const recipients = [
            { firstName: 'John', lastName: 'Doe', phoneNumber: '+12025550179', email: 'john@example.com' },
            { firstName: 'Jane', lastName: 'Smith', phoneNumber: '+12025550123', email: 'jane@example.com' },
            { firstName: 'Bob', lastName: 'Johnson', phoneNumber: '+12025550145', email: 'bob@example.com' }
        ];

        for (const recipient of recipients) {
            await client.query(
                `INSERT INTO recipients (user_id, first_name, last_name, phone_number, email)
                 VALUES ($1, $2, $3, $4, $5)`,
                [userId, recipient.firstName, recipient.lastName, recipient.phoneNumber, recipient.email]
            );
        }

        // Insert sample events
        const now = new Date();
        const events = [
            {
                title: 'Team Meeting',
                description: 'Weekly team sync-up',
                eventDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // One week from now
                location: 'Conference Room A'
            },
            {
                title: 'Product Launch',
                description: 'New product release celebration',
                eventDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // Two weeks from now
                location: 'Main Auditorium'
            },
            {
                title: 'Client Presentation',
                description: 'Quarterly results review',
                eventDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Three days from now
                location: 'Meeting Room B'
            }
        ];

        for (const event of events) {
            await client.query(
                `INSERT INTO events (user_id, title, description, event_date, location, status)
                 VALUES ($1, $2, $3, $4, $5, 'active')`,
                [userId, event.title, event.description, event.eventDate, event.location]
            );
        }

        await client.query('COMMIT');
        logger.info('Database seeding completed successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error during database seeding:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

// Run seeding if called directly
if (require.main === module) {
    seed().catch(err => {
        logger.error('Seeding failed:', err);
        process.exit(1);
    });
}

module.exports = seed;