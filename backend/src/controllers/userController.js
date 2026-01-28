const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/database');

/**
 * Generate a strong random password
 */
const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

/**
 * Log admin action to admin_action_log table
 */
const logAdminAction = async (adminId, actionType, targetType, targetId, details, ipAddress = null) => {
    try {
        await db.execute(
            `INSERT INTO admin_action_log (admin_id, action_type, target_type, target_id, details, ip_address)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [adminId, actionType, targetType, targetId, JSON.stringify(details), ipAddress]
        );
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
};

/**
 * GET /api/users
 * Get all learner users
 */
const getAllLearners = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                u.id, u.email, u.first_name, u.last_name, u.department, u.business_unit,
                u.status, u.last_login_at, u.created_at,
                (SELECT COUNT(*) FROM course_assignments ca WHERE ca.user_id = u.id) as assigned_courses_count
            FROM users u
            WHERE u.role = 'learner' AND u.status != 'deleted'
            ORDER BY u.created_at DESC
        `);

        const users = rows.map(row => ({
            id: row.id.toString(),
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            department: row.department,
            businessUnit: row.business_unit,
            status: row.status,
            lastLoginAt: row.last_login_at,
            createdAt: row.created_at,
            assignedCoursesCount: row.assigned_courses_count
        }));

        res.json(users);
    } catch (error) {
        console.error('Get learners error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

/**
 * GET /api/users/:id
 * Get single user with their assignments
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get user
        const [userRows] = await db.execute(`
            SELECT id, email, first_name, last_name, department, business_unit, status, last_login_at, created_at
            FROM users
            WHERE id = ? AND role = 'learner'
        `, [id]);

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userRows[0];

        // Get assignments with course details
        const [assignmentRows] = await db.execute(`
            SELECT 
                ca.id, ca.course_id, ca.assigned_at, ca.deadline_at, ca.status, ca.completed_at, ca.last_access_at,
                c.title, c.description, cc.name as category, c.version
            FROM course_assignments ca
            JOIN courses c ON ca.course_id = c.id
            LEFT JOIN course_categories cc ON c.category_id = cc.id
            WHERE ca.user_id = ?
            ORDER BY ca.assigned_at DESC
        `, [id]);

        const assignments = assignmentRows.map(row => ({
            id: row.id.toString(),
            courseId: row.course_id.toString(),
            assignedAt: row.assigned_at,
            deadline: row.deadline_at,
            status: row.status,
            completedAt: row.completed_at,
            lastAccessAt: row.last_access_at,
            course: {
                id: row.course_id.toString(),
                title: row.title,
                description: row.description,
                category: row.category,
                version: row.version
            }
        }));

        res.json({
            id: user.id.toString(),
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            department: user.department,
            businessUnit: user.business_unit,
            status: user.status,
            lastLoginAt: user.last_login_at,
            createdAt: user.created_at,
            assignedCoursesCount: assignments.length,
            assignments
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

/**
 * POST /api/users
 * Create new learner user
 */
const createUser = async (req, res) => {
    try {
        const { email, firstName, lastName, department, businessUnit } = req.body;

        // Validate required fields
        if (!email || !firstName || !lastName) {
            return res.status(400).json({ error: 'Email, first name and last name are required' });
        }

        // Check if email already exists
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // Generate password
        const generatedPassword = generatePassword();
        const passwordHash = await bcrypt.hash(generatedPassword, 10);

        // Insert user
        const [result] = await db.execute(`
            INSERT INTO users (email, password_hash, first_name, last_name, role, department, business_unit, status)
            VALUES (?, ?, ?, ?, 'learner', ?, ?, 'active')
        `, [email, passwordHash, firstName, lastName, department || null, businessUnit || null]);

        // Log action
        await logAdminAction(
            req.user.userId,
            'CREATE_USER',
            'user',
            result.insertId,
            { email, firstName, lastName }
        );

        res.status(201).json({
            user: {
                id: result.insertId.toString(),
                email,
                firstName,
                lastName,
                department,
                businessUnit,
                status: 'active',
                createdAt: new Date().toISOString(),
                assignedCoursesCount: 0
            },
            generatedPassword
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

/**
 * PUT /api/users/:id
 * Update user data
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, department, businessUnit } = req.body;

        // Check user exists
        const [existing] = await db.execute('SELECT id FROM users WHERE id = ? AND role = ?', [id, 'learner']);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (firstName !== undefined) { updates.push('first_name = ?'); values.push(firstName); }
        if (lastName !== undefined) { updates.push('last_name = ?'); values.push(lastName); }
        if (department !== undefined) { updates.push('department = ?'); values.push(department); }
        if (businessUnit !== undefined) { updates.push('business_unit = ?'); values.push(businessUnit); }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(id);
        await db.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

        // Log action
        await logAdminAction(req.user.userId, 'UPDATE_USER', 'user', id, { firstName, lastName, department, businessUnit });

        // Return updated user
        const [updated] = await db.execute(`
            SELECT id, email, first_name, last_name, department, business_unit, status, last_login_at, created_at
            FROM users WHERE id = ?
        `, [id]);

        const user = updated[0];
        res.json({
            id: user.id.toString(),
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            department: user.department,
            businessUnit: user.business_unit,
            status: user.status,
            lastLoginAt: user.last_login_at,
            createdAt: user.created_at
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

/**
 * POST /api/users/:id/deactivate
 * Deactivate user
 */
const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            'UPDATE users SET status = ? WHERE id = ? AND role = ?',
            ['inactive', id, 'learner']
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        await logAdminAction(req.user.userId, 'DEACTIVATE_USER', 'user', id, {});

        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        console.error('Deactivate user error:', error);
        res.status(500).json({ error: 'Failed to deactivate user' });
    }
};

/**
 * POST /api/users/:id/reactivate
 * Reactivate user
 */
const reactivateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            'UPDATE users SET status = ? WHERE id = ? AND role = ?',
            ['active', id, 'learner']
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        await logAdminAction(req.user.userId, 'REACTIVATE_USER', 'user', id, {});

        res.json({ message: 'User reactivated successfully' });
    } catch (error) {
        console.error('Reactivate user error:', error);
        res.status(500).json({ error: 'Failed to reactivate user' });
    }
};

/**
 * DELETE /api/users/:id
 * Soft delete user
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            'UPDATE users SET status = ? WHERE id = ? AND role = ?',
            ['deleted', id, 'learner']
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        await logAdminAction(req.user.userId, 'DELETE_USER', 'user', id, {});

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

/**
 * POST /api/users/:id/reset-password
 * Reset user password
 */
const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;

        // Check user exists
        const [existing] = await db.execute('SELECT id, email FROM users WHERE id = ? AND role = ?', [id, 'learner']);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate new password
        const newPassword = generatePassword();
        const passwordHash = await bcrypt.hash(newPassword, 10);

        await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);

        await logAdminAction(req.user.userId, 'RESET_PASSWORD', 'user', id, { email: existing[0].email });

        res.json({ newPassword });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

/**
 * POST /api/users/:id/assign-course
 * Assign course to user
 */
const assignCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseId, deadlineDays } = req.body;

        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }

        // Check user exists
        const [userExists] = await db.execute('SELECT id FROM users WHERE id = ? AND role = ?', [id, 'learner']);
        if (userExists.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check course exists and is published
        const [courseRows] = await db.execute(
            'SELECT id, title, deadline_days FROM courses WHERE id = ? AND status = ?',
            [courseId, 'published']
        );
        if (courseRows.length === 0) {
            return res.status(404).json({ error: 'Course not found or not published' });
        }

        const course = courseRows[0];

        // Check if already assigned
        const [existingAssign] = await db.execute(
            'SELECT id FROM course_assignments WHERE user_id = ? AND course_id = ?',
            [id, courseId]
        );
        if (existingAssign.length > 0) {
            return res.status(409).json({ error: 'Course already assigned to this user' });
        }

        // Calculate deadline
        const daysToComplete = deadlineDays || course.deadline_days || 30;
        const deadlineAt = new Date();
        deadlineAt.setDate(deadlineAt.getDate() + daysToComplete);

        // Create assignment
        const [result] = await db.execute(`
            INSERT INTO course_assignments (user_id, course_id, assigned_by, assigned_at, deadline_at, status)
            VALUES (?, ?, ?, NOW(), ?, 'not_started')
        `, [id, courseId, req.user.userId, deadlineAt]);

        await logAdminAction(req.user.userId, 'ASSIGN_COURSE', 'course_assignment', result.insertId, {
            userId: id,
            courseId,
            courseTitle: course.title,
            deadlineDays: daysToComplete
        });

        res.status(201).json({
            id: result.insertId.toString(),
            courseId: courseId.toString(),
            userId: id.toString(),
            assignedAt: new Date().toISOString(),
            deadline: deadlineAt.toISOString(),
            status: 'not_started',
            course: {
                id: course.id.toString(),
                title: course.title
            }
        });
    } catch (error) {
        console.error('Assign course error:', error);
        res.status(500).json({ error: 'Failed to assign course' });
    }
};

/**
 * DELETE /api/users/:id/assignments/:assignmentId
 * Remove course assignment
 */
const unassignCourse = async (req, res) => {
    try {
        const { id, assignmentId } = req.params;

        // Check assignment exists and belongs to user
        const [existing] = await db.execute(
            'SELECT ca.id, c.title FROM course_assignments ca JOIN courses c ON ca.course_id = c.id WHERE ca.id = ? AND ca.user_id = ?',
            [assignmentId, id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Delete assignment (and its progress via CASCADE)
        await db.execute('DELETE FROM course_assignments WHERE id = ?', [assignmentId]);

        await logAdminAction(req.user.userId, 'UNASSIGN_COURSE', 'course_assignment', assignmentId, {
            userId: id,
            courseTitle: existing[0].title
        });

        res.json({ message: 'Course unassigned successfully' });
    } catch (error) {
        console.error('Unassign course error:', error);
        res.status(500).json({ error: 'Failed to unassign course' });
    }
};

/**
 * GET /api/users/:id/assignments
 * Get all assignments for a user
 */
const getUserAssignments = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(`
            SELECT 
                ca.id, ca.course_id, ca.assigned_at, ca.deadline_at, ca.status, ca.completed_at, ca.last_access_at,
                c.title, c.description, cc.name as category, c.version, c.deadline_days
            FROM course_assignments ca
            JOIN courses c ON ca.course_id = c.id
            LEFT JOIN course_categories cc ON c.category_id = cc.id
            WHERE ca.user_id = ?
            ORDER BY ca.assigned_at DESC
        `, [id]);

        const assignments = rows.map(row => ({
            id: row.id.toString(),
            courseId: row.course_id.toString(),
            assignedAt: row.assigned_at,
            deadline: row.deadline_at,
            status: row.status,
            completedAt: row.completed_at,
            lastAccessAt: row.last_access_at,
            course: {
                id: row.course_id.toString(),
                title: row.title,
                description: row.description,
                category: row.category,
                version: row.version,
                deadlineDays: row.deadline_days
            }
        }));

        res.json(assignments);
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
};

/**
 * POST /api/users/bulk-assign
 * Assign multiple courses to multiple users
 */
const bulkAssignCourses = async (req, res) => {
    try {
        const { userIds, courseIds, deadlineDays } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'User IDs array is required' });
        }
        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({ error: 'Course IDs array is required' });
        }

        // 1. Verify all courses exist and are published
        // We can do this in one query or just try to insert and rely on FK (but we need published check)
        // Let's fetch valid courses first to get their default deadlines if needed.
        const coursePlaceholders = courseIds.map(() => '?').join(',');
        const [courses] = await db.execute(
            `SELECT id, title, deadline_days FROM courses WHERE id IN (${coursePlaceholders}) AND status = 'published'`,
            courseIds
        );

        if (courses.length !== courseIds.length) {
            // Some courses might be invalid or not published
            // For bulk operations, we can either fail strictly or skip invalid ones. 
            // Strict is safer to avoid confusion.
            return res.status(400).json({ error: 'One or more courses are invalid or not published' });
        }

        const courseMap = new Map(courses.map(c => [c.id, c]));

        // 2. Prepare assignments
        const assignmentsToInsert = [];
        const skipped = [];
        const success = [];

        // We need to check existing assignments to avoid duplicates
        // SELECT * FROM course_assignments WHERE user_id IN (...) AND course_id IN (...)
        const userPlaceholders = userIds.map(() => '?').join(',');

        const [existingAssignments] = await db.execute(
            `SELECT user_id, course_id FROM course_assignments 
             WHERE user_id IN (${userPlaceholders}) 
             AND course_id IN (${coursePlaceholders})`,
            [...userIds, ...courseIds]
        );

        const existingSet = new Set(
            existingAssignments.map(a => `${a.user_id}-${a.course_id}`)
        );

        for (const userId of userIds) {
            for (const courseId of courseIds) {
                if (existingSet.has(`${userId}-${courseId}`)) {
                    skipped.push({ userId, courseId, reason: 'Already assigned' });
                    continue;
                }

                const course = courseMap.get(parseInt(courseId)); // IDs might be coming as strings or numbers
                if (!course) continue; // Should not happen given check above, but safely handle

                const daysToComplete = deadlineDays || course.deadline_days || 30;
                const deadlineAt = new Date();
                deadlineAt.setDate(deadlineAt.getDate() + daysToComplete);

                assignmentsToInsert.push([
                    userId,
                    courseId,
                    req.user.userId,
                    new Date(),
                    deadlineAt,
                    'not_started'
                ]);

                success.push({ userId, courseId });
            }
        }

        // 3. Insert assignments
        if (assignmentsToInsert.length > 0) {
            const valuesPlaceholder = assignmentsToInsert.map(() => '(?, ?, ?, ?, ?, ?)').join(',');
            const flatValues = assignmentsToInsert.flat();

            await db.execute(
                `INSERT INTO course_assignments (user_id, course_id, assigned_by, assigned_at, deadline_at, status) 
                 VALUES ${valuesPlaceholder}`,
                flatValues
            );

            // 4. Log Action
            // Log one bulk action or individual? Bulk action log might be cleaner but table key is singular.
            // Let's log a summary generic action for the admin
            await logAdminAction(req.user.userId, 'BULK_ASSIGN_COURSE', 'course_assignment', null, {
                userIdsCount: userIds.length,
                courseIdsCount: courseIds.length,
                assignedCount: assignmentsToInsert.length,
                skippedCount: skipped.length
            });
        }

        res.json({
            message: 'Bulk assignment processed',
            summary: {
                requested: userIds.length * courseIds.length,
                assigned: assignmentsToInsert.length,
                skipped: skipped.length
            },
            skipped
        });

    } catch (error) {
        console.error('Bulk assign error:', error);
        res.status(500).json({ error: 'Failed to perform bulk assignment' });
    }
};

module.exports = {
    getAllLearners,
    getUserById,
    createUser,
    updateUser,
    deactivateUser,
    reactivateUser,
    deleteUser,
    resetPassword,
    assignCourse,
    bulkAssignCourses,
    unassignCourse,
    getUserAssignments
};
