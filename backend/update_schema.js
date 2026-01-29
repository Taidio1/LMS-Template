require('dotenv').config();
const db = require('./src/config/database');

async function updateSchema() {
    try {
        console.log('Updating course_chapters ENUM...');
        await db.execute("ALTER TABLE course_chapters MODIFY COLUMN type ENUM('video', 'slide', 'quiz', 'document') NOT NULL");
        console.log('✅ Schema updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Schema update failed:', error);
        process.exit(1);
    }
}

updateSchema();
