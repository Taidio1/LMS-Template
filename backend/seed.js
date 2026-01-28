/**
 * Script to seed test users directly via the backend connection
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function seedUsers() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        // Generate bcrypt hash for test123
        const passwordHash = await bcrypt.hash('test123', 10);
        console.log('Generated hash:', passwordHash);

        // Delete existing test users
        await pool.execute("DELETE FROM users WHERE email IN ('admin@example.com', 'learner@example.com')");
        console.log('Cleared existing test users');

        // Insert admin user
        await pool.execute(
            `INSERT INTO users (email, password_hash, first_name, last_name, role, department, business_unit, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['admin@example.com', passwordHash, 'Admin', 'User', 'admin', 'Management', 'Corporate', 'active']
        );
        console.log('✅ Created admin@example.com');

        // Insert learner user
        await pool.execute(
            `INSERT INTO users (email, password_hash, first_name, last_name, role, department, business_unit, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['learner@example.com', passwordHash, 'John', 'Doe', 'learner', 'IT', 'Technology', 'active']
        );
        console.log('✅ Created learner@example.com');

        // Verify
        const [users] = await pool.execute("SELECT id, email, role FROM users WHERE email IN ('admin@example.com', 'learner@example.com')");
        console.log('\nSeeded users:');
        users.forEach(u => console.log(`  - ${u.email} (${u.role}) [id: ${u.id}]`));

        console.log('\n🎉 Seed complete! Login with:');
        console.log('   Email: admin@example.com or learner@example.com');
        console.log('   Password: test123');

    } catch (error) {
        console.error('❌ Seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedUsers();
