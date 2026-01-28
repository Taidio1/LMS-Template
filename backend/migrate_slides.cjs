require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database.');

        // Check if column exists
        const [columns] = await connection.query(`
            SHOW COLUMNS FROM course_slides LIKE 'chapter_id'
        `);

        if (columns.length === 0) {
            console.log('Adding chapter_id column to course_slides...');
            await connection.query(`
                ALTER TABLE course_slides
                ADD COLUMN chapter_id INT COMMENT 'Link to the chapter this slide belongs to' AFTER course_id,
                ADD CONSTRAINT fk_course_slides_chapter
                FOREIGN KEY (chapter_id) REFERENCES course_chapters(id) ON DELETE CASCADE
            `);
            console.log('Column added successfully.');
        } else {
            console.log('Column chapter_id already exists.');
        }

        await connection.end();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
