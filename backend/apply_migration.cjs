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

        await connection.query(`
            CREATE TABLE IF NOT EXISTS course_chapters (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                title VARCHAR(255),
                type ENUM('video', 'slide', 'quiz') NOT NULL,
                content_data JSON COMMENT 'Stores video URL, slides list, or quiz config',
                order_index INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            );
        `);

        console.log('Migration successful: course_chapters table created.');
        await connection.end();
    } catch (error) {
        console.error('Migration failed:', error);
        console.error('DB_USER:', process.env.DB_USER);
        process.exit(1);
    }
}

migrate();
