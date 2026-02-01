const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ? AND status = "active"',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = rows[0];

        // 2. Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // 3. Update last_login_at
        await db.execute(
            'UPDATE users SET last_login_at = NOW() WHERE id = ?',
            [user.id]
        );

        // 4. Generate JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // 5. Return user data (without password)
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                name: `${user.first_name} ${user.last_name}`.trim(),
                role: user.role,
                department: user.department
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Server error during login',
            details: error.message,
            code: error.code
        });
    }
};

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
const me = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, email, first_name, last_name, role, department, business_unit, last_login_at FROM users WHERE id = ?',
            [req.user.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = rows[0];
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            name: `${user.first_name} ${user.last_name}`.trim(),
            role: user.role,
            department: user.department,
            businessUnit: user.business_unit,
            lastLoginAt: user.last_login_at
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * POST /api/auth/logout
 * Logout (client-side token removal, server-side just confirms)
 */
const logout = async (req, res) => {
    // JWT is stateless - client removes the token
    // Future: Implement token blacklist if needed
    res.json({ message: 'Logged out successfully' });
};

/**
 * POST /api/auth/change-password
 * Change current user's password
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters long' });
        }

        // 1. Get user with password hash
        const [rows] = await db.execute(
            'SELECT id, password_hash FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = rows[0];

        // 2. Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid current password' });
        }

        // 3. Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update password in DB
        await db.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};

module.exports = { login, me, logout, changePassword };
