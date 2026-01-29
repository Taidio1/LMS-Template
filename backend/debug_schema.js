require('dotenv').config();
const db = require('./src/config/database');

async function debugSchema() {
    try {
        const [rows] = await db.execute("SHOW COLUMNS FROM course_chapters LIKE 'type'");
        console.log('Column Info:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debugSchema();
