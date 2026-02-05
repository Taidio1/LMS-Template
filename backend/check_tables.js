
require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkTables() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        const [rows] = await pool.execute("SHOW TABLES");
        console.log("Tables in database:");
        rows.forEach(row => {
            console.log(Object.values(row)[0]);
        });

        // specific check for test_user_answers
        const tableName = 'test_user_answers';
        const exists = rows.some(r => Object.values(r)[0] === tableName);

        if (exists) {
            console.log(`\nTable '${tableName}' EXISTS.`);
            // Show columns
            const [columns] = await pool.execute(`DESCRIBE ${tableName}`);
            console.log('Columns:', columns.map(c => c.Field));
        } else {
            console.log(`\nTable '${tableName}' DOES NOT EXIST.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkTables();
