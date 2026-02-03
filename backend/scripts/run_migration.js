require('dotenv').config({ path: 'e:/LMS-Template/backend/.env' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true // Enable multiple statements for SQL script
    });

    try {
        const sqlPath = path.join(__dirname, '../create_test_assignments.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Executing migration from:', sqlPath);

        await pool.query(sql);
        console.log('✅ Migration applied successfully.');

    } catch (e) {
        console.error('❌ Migration failed:', e);
    } finally {
        pool.end();
    }
}

migrate();
