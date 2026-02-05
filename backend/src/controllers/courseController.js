const db = require('../config/database');

/**
 * GET /api/courses/my-courses
 * Get all courses assigned to the authenticated user with deadline calculations
 */
const getMyCourses = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                ca.id AS assignment_id,
                ca.user_id,
                ca.course_id,
                ca.status,
                ca.assigned_at,
                ca.deadline_at,
                ca.completed_at,
                ca.last_access_at,
                c.id,
                c.title,
                c.description,
                c.category_id,
                cat.name AS category_name,
                cat.order_index AS category_order,
                c.order_in_category,
                c.department,
                c.version,
                c.status AS course_status,
                c.deadline_days,
                c.has_course_test,
                TIMESTAMPDIFF(SECOND, NOW(), ca.deadline_at) AS seconds_remaining,
                CASE WHEN ca.deadline_at < NOW() AND ca.status != 'completed' THEN TRUE ELSE FALSE END AS is_overdue,
                CASE WHEN TIMESTAMPDIFF(HOUR, NOW(), ca.deadline_at) < 48 AND ca.deadline_at > NOW() THEN TRUE ELSE FALSE END AS is_urgent
            FROM course_assignments ca
            JOIN courses c ON ca.course_id = c.id
            LEFT JOIN course_categories cat ON c.category_id = cat.id
            WHERE ca.user_id = ? AND c.status = 'published'
            ORDER BY 
                cat.order_index ASC,
                c.order_in_category ASC,
                ca.deadline_at ASC
        `, [req.user.userId]);

        // Calculate locking logic (Sequential Access)
        // Group by category to find previous course status
        const coursesByCategory = {};

        // First pass: Organize
        rows.forEach(row => {
            const catId = row.category_id || 'uncategorized';
            if (!coursesByCategory[catId]) coursesByCategory[catId] = [];
            coursesByCategory[catId].push(row);
        });

        // Second pass: Determine locking
        // For each category, sort by order_in_category (already sorted by query, but good to be safe)
        const coursesWithLock = rows.map(row => {
            let isLocked = false;
            if (row.category_id) {
                const siblings = coursesByCategory[row.category_id];
                // Find previous course index in the sorted list
                const currentIndex = siblings.findIndex(s => s.assignment_id === row.assignment_id);
                if (currentIndex > 0) {
                    const prevCourse = siblings[currentIndex - 1];
                    if (prevCourse.status !== 'completed') {
                        isLocked = true;
                    }
                }
            }

            return {
                id: row.assignment_id.toString(),
                courseId: row.course_id.toString(),
                userId: row.user_id.toString(),
                status: row.is_overdue ? 'overdue' : row.status,
                assignedAt: row.assigned_at,
                deadline: row.deadline_at,
                completedAt: row.completed_at,
                lastAccessAt: row.last_access_at,
                secondsRemaining: Math.max(0, row.seconds_remaining || 0),
                isOverdue: !!row.is_overdue,
                isUrgent: !!row.is_urgent,
                isLocked,
                course: {
                    id: row.course_id.toString(),
                    title: row.title,
                    description: row.description,
                    categoryId: row.category_id,
                    categoryName: row.category_name, // New field
                    orderInCategory: row.order_in_category, // New field,
                    category: row.category_name, // Backward compatibility
                    department: row.department,
                    version: row.version,
                    status: row.course_status,
                    deadlineDays: row.deadline_days,
                    hasCourseTest: !!row.has_course_test
                }
            };
        });

        res.json(coursesWithLock);
    } catch (error) {
        console.error('Get my courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

/**
 * GET /api/courses/:id
 * Get a specific course with its content
 */
/**
 * GET /api/courses/:id
 * Get a specific course with its content
 */
const getCourseById = async (req, res) => {
    try {
        const courseId = req.params.id;
        const { userId, role } = req.user;

        // Get course details
        const [courseRows] = await db.execute(`
            SELECT c.*, cc.name as category_name
            FROM courses c
            LEFT JOIN course_categories cc ON c.category_id = cc.id
            WHERE c.id = ?
        `, [courseId]);

        if (courseRows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const course = courseRows[0];

        // Authorization Check
        if (role !== 'admin') {
            // 1. Check if course is published
            if (course.status !== 'published') {
                return res.status(403).json({ error: 'Access denied. Course is not published.' });
            }

            // 2. Check if user is assigned to the course
            const [assignmentRows] = await db.execute(
                'SELECT id FROM course_assignments WHERE user_id = ? AND course_id = ?',
                [userId, courseId]
            );

            if (assignmentRows.length === 0) {
                return res.status(403).json({ error: 'Access denied. You are not assigned to this course.' });
            }
        }

        // Get chapters (Unified content)
        const [chapterRows] = await db.execute(
            'SELECT * FROM course_chapters WHERE course_id = ? ORDER BY order_index',
            [courseId]
        );

        // Get slides
        const [slideRows] = await db.execute(
            'SELECT * FROM course_slides WHERE course_id = ? ORDER BY order_index',
            [courseId]
        );

        res.json({
            id: course.id.toString(),
            title: course.title,
            description: course.description,
            category: course.category_name,
            department: course.department,
            version: course.version,
            status: course.status,
            deadlineDays: course.deadline_days,
            deadlineHours: course.deadline_hours,
            hasCourseTest: !!course.has_course_test,
            chapters: chapterRows.map(ch => {
                let content = ch.content_data;
                if (typeof content === 'string') {
                    try { content = JSON.parse(content); } catch (e) { content = {}; }
                }

                // Reattach slides if type is slide
                if (ch.type === 'slide') {
                    content.slides = slideRows
                        .filter(s => s.chapter_id === ch.id)
                        .map(s => ({
                            id: s.id.toString(),
                            title: s.title,
                            text: s.content_text,
                            imageUrl: s.image_path,
                            // order: s.order_index
                        }));
                }

                return {
                    id: ch.id.toString(),
                    title: ch.title,
                    type: ch.type,
                    content: content || {},
                    order: ch.order_index
                };
            })
        });
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ error: 'Failed to fetch course' });
    }
};

/**
 * PUT /api/courses/:id/chapters (Admin only)
 * Update (Replace) all chapters for a course
 */
/**
 * PUT /api/courses/:id/chapters (Admin only)
 * Update (Replace) all chapters for a course
 */
const updateChapters = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const courseId = req.params.id;
        const chapters = req.body; // Expecting array of chapters

        // 1. Verify course exists
        const [course] = await connection.execute('SELECT id FROM courses WHERE id = ?', [courseId]);
        if (course.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Course not found' });
        }

        // 2. Delete existing chapters (Full Replace Strategy)
        // Also clean up any orphan slides for this course to be safe
        await connection.execute('DELETE FROM course_chapters WHERE course_id = ?', [courseId]);
        await connection.execute('DELETE FROM course_slides WHERE course_id = ?', [courseId]);

        // 3. Insert new chapters
        if (chapters && chapters.length > 0) {
            for (let i = 0; i < chapters.length; i++) {
                const ch = chapters[i];
                let contentData = ch.content || {};
                const slides = ch.type === 'slide' ? (contentData.slides || []) : [];

                // Remove slides from JSON content to avoid duplication/bloat
                if (ch.type === 'slide') {
                    contentData = { ...contentData };
                    delete contentData.slides;
                }

                // Insert Chapter
                const [result] = await connection.execute(
                    'INSERT INTO course_chapters (course_id, title, type, content_data, order_index) VALUES (?, ?, ?, ?, ?)',
                    [
                        courseId,
                        ch.title || 'Untitled Chapter',
                        ch.type,
                        JSON.stringify(contentData),
                        i
                    ]
                );

                const chapterId = result.insertId;

                // Insert Slides if any
                if (ch.type === 'slide' && slides.length > 0) {
                    const slideValues = [];
                    const slidePlaceholders = [];
                    slides.forEach((slide, sIdx) => {
                        slidePlaceholders.push('(?, ?, ?, ?, ?, ?, ?)');
                        slideValues.push(
                            courseId,
                            chapterId,
                            slide.title || 'Untitled Slide',
                            slide.text || '',
                            slide.imageUrl ? slide.imageUrl.trim() : null,
                            null, // image_name
                            sIdx // order
                        );
                    });

                    await connection.execute(
                        `INSERT INTO course_slides (course_id, chapter_id, title, content_text, image_path, image_name, order_index) VALUES ${slidePlaceholders.join(', ')}`,
                        slideValues
                    );
                }
            }
        }

        await connection.commit();

        // Fetch fresh data to return
        const [chapterRows] = await connection.execute(
            'SELECT * FROM course_chapters WHERE course_id = ? ORDER BY order_index',
            [courseId]
        );

        const [slideRows] = await connection.execute(
            'SELECT * FROM course_slides WHERE course_id = ? ORDER BY order_index',
            [courseId]
        );

        res.json(chapterRows.map(ch => {
            let content = ch.content_data;
            if (typeof content === 'string') {
                try { content = JSON.parse(content); } catch (e) { content = {}; }
            }

            // Reattach slides if type is slide
            if (ch.type === 'slide') {
                content.slides = slideRows
                    .filter(s => s.chapter_id === ch.id)
                    .map(s => ({
                        id: s.id.toString(),
                        title: s.title,
                        text: s.content_text,
                        imageUrl: s.image_path,
                        // order: s.order_index
                    }));
            }

            return {
                id: ch.id.toString(),
                title: ch.title,
                type: ch.type,
                content: content,
                order: ch.order_index
            };
        }));

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Update chapters error:', error);
        res.status(500).json({ error: 'Failed to update chapters' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * GET /api/courses (Admin only)
 * Get all courses for admin management
 */
const getAllCourses = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                c.*,
                cat.name as category_name,
                cat.order_index as category_order,
                u.first_name AS owner_first_name,
                u.last_name AS owner_last_name,
                COUNT(DISTINCT ca.id) AS assignment_count
            FROM courses c
            LEFT JOIN users u ON c.owner_id = u.id
            LEFT JOIN course_assignments ca ON c.id = ca.course_id
            LEFT JOIN course_categories cat ON c.category_id = cat.id
            GROUP BY c.id
            ORDER BY cat.order_index ASC, c.order_in_category ASC, c.created_at DESC
        `);

        res.json(rows.map(row => ({
            id: row.id.toString(),
            title: row.title,
            description: row.description,
            categoryId: row.category_id,
            categoryName: row.category_name,
            orderInCategory: row.order_in_category,
            category: row.category_name, // Backward compat
            department: row.department,
            version: row.version,
            status: row.status,
            deadlineDays: row.deadline_days,
            hasCourseTest: !!row.has_course_test,
            owner: row.owner_first_name ? `${row.owner_first_name} ${row.owner_last_name}` : null,
            assignmentCount: row.assignment_count,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        })));
    } catch (error) {
        console.error('Get all courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

/**
 * POST /api/courses (Admin only)
 * Create a new course
 */
const createCourse = async (req, res) => {
    try {
        const { title, description, categoryId, orderInCategory, department, deadlineDays, deadlineHours, version } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Fetch category name if categoryId is provided
        let categoryName = null;
        if (categoryId) {
            const [catRows] = await db.execute('SELECT name FROM course_categories WHERE id = ?', [categoryId]);
            if (catRows.length > 0) {
                categoryName = catRows[0].name;
            }
        }

        const [result] = await db.execute(
            `INSERT INTO courses (title, description, category_id, order_in_category, department, deadline_days, deadline_hours, version, owner_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [
                title.trim(),
                description || null,
                categoryId || null,
                orderInCategory || 0,
                department || null,
                deadlineDays || 0,
                deadlineHours || 0,
                version || 'v1',
                req.user.userId
            ]
        );

        const courseId = result.insertId;

        // Fetch the created course
        const [rows] = await db.execute(`
            SELECT c.*, cat.name as category_name 
            FROM courses c
            LEFT JOIN course_categories cat ON c.category_id = cat.id
            WHERE c.id = ?
        `, [courseId]);
        const course = rows[0];

        res.status(201).json({
            id: course.id.toString(),
            title: course.title,
            description: course.description,
            categoryId: course.category_id,
            categoryName: course.category_name,
            orderInCategory: course.order_in_category,
            department: course.department,
            version: course.version,
            status: course.status,
            deadlineDays: course.deadline_days,
            deadlineHours: course.deadline_hours,
            hasCourseTest: !!course.has_course_test,
            createdAt: course.created_at,
            updatedAt: course.updated_at
        });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
};

/**
 * PUT /api/courses/:id (Admin only)
 * Update course metadata
 */
const updateCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const { title, description, categoryId, orderInCategory, department, deadlineDays, deadlineHours, version } = req.body;

        // Check if course exists
        const [existing] = await db.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (title !== undefined) {
            updates.push('title = ?');
            values.push(title.trim());
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (categoryId !== undefined) {
            updates.push('category_id = ?');
            values.push(categoryId);
        }
        if (orderInCategory !== undefined) {
            updates.push('order_in_category = ?');
            values.push(orderInCategory);
        }
        if (department !== undefined) {
            updates.push('department = ?');
            values.push(department);
        }
        if (deadlineDays !== undefined) {
            updates.push('deadline_days = ?');
            values.push(deadlineDays);
        }
        if (deadlineHours !== undefined) {
            updates.push('deadline_hours = ?');
            values.push(deadlineHours);
        }
        if (version !== undefined) {
            updates.push('version = ?');
            values.push(version);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(courseId);
        await db.execute(
            `UPDATE courses SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Fetch updated course
        const [rows] = await db.execute(`
            SELECT c.*, cat.name as category_name, u.first_name AS owner_first_name, u.last_name AS owner_last_name,
                   COUNT(DISTINCT ca.id) AS assignment_count
            FROM courses c
            LEFT JOIN users u ON c.owner_id = u.id
            LEFT JOIN course_assignments ca ON c.id = ca.course_id
            LEFT JOIN course_categories cat ON c.category_id = cat.id
            WHERE c.id = ?
            GROUP BY c.id
        `, [courseId]);

        const course = rows[0];
        res.json({
            id: course.id.toString(),
            title: course.title,
            description: course.description,
            categoryId: course.category_id,
            categoryName: course.category_name,
            orderInCategory: course.order_in_category,
            department: course.department,
            version: course.version,
            status: course.status,
            deadlineDays: course.deadline_days,
            deadlineHours: course.deadline_hours,
            hasCourseTest: !!course.has_course_test,
            owner: course.owner_first_name ? `${course.owner_first_name} ${course.owner_last_name}` : null,
            assignmentCount: course.assignment_count,
            createdAt: course.created_at,
            updatedAt: course.updated_at
        });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
};

/**
 * DELETE /api/courses/:id (Admin only)
 * Delete a course (only if no assignments exist)
 */
const deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id;

        // Check if course exists
        const [existing] = await db.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check for existing assignments
        const [assignments] = await db.execute(
            'SELECT COUNT(*) as count FROM course_assignments WHERE course_id = ?',
            [courseId]
        );

        if (assignments[0].count > 0) {
            return res.status(400).json({
                error: 'Cannot delete course with existing assignments. Archive the course instead.'
            });
        }

        // Delete course (cascade will handle content and slides)
        await db.execute('DELETE FROM courses WHERE id = ?', [courseId]);

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
};

/**
 * POST /api/courses/:id/publish (Admin only)
 * Publish a course (change status from draft to published)
 */
const publishCourse = async (req, res) => {
    try {
        const courseId = req.params.id;

        // Check if course exists
        const [existing] = await db.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const course = existing[0];
        if (course.status === 'published') {
            return res.status(400).json({ error: 'Course is already published' });
        }

        await db.execute("UPDATE courses SET status = 'published' WHERE id = ?", [courseId]);

        res.json({ message: 'Course published successfully', status: 'published' });
    } catch (error) {
        console.error('Publish course error:', error);
        res.status(500).json({ error: 'Failed to publish course' });
    }
};

/**
 * POST /api/courses/:id/archive (Admin only)
 * Archive a course
 */
const archiveCourse = async (req, res) => {
    try {
        const courseId = req.params.id;

        // Check if course exists
        const [existing] = await db.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        await db.execute("UPDATE courses SET status = 'archived' WHERE id = ?", [courseId]);

        res.json({ message: 'Course archived successfully', status: 'archived' });
    } catch (error) {
        console.error('Archive course error:', error);
        res.status(500).json({ error: 'Failed to archive course' });
    }
};

/**
 * POST /api/courses/:id/restore (Admin only)
 * Restore an archived course (change status from archived to draft)
 */
const restoreCourse = async (req, res) => {
    try {
        const courseId = req.params.id;

        // Check if course exists
        const [existing] = await db.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const course = existing[0];
        if (course.status !== 'archived') {
            return res.status(400).json({ error: 'Course is not archived' });
        }

        await db.execute("UPDATE courses SET status = 'draft' WHERE id = ?", [courseId]);

        res.json({ message: 'Course restored successfully', status: 'draft' });
    } catch (error) {
        console.error('Restore course error:', error);
        res.status(500).json({ error: 'Failed to restore course' });
    }
};

module.exports = {
    getMyCourses,
    getCourseById,
    getAllCourses,
    createCourse,
    updateCourse,
    updateChapters,
    deleteCourse,
    publishCourse,
    publishCourse,
    archiveCourse,
    restoreCourse
};
