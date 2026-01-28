const db = require('../config/database');

/**
 * GET /api/programs
 * Get all programs assigned to the authenticated user with progress summary
 */
const getMyPrograms = async (req, res) => {
    try {
        // Get distinct programs (categories/departments) that have courses assigned to the user
        const [programs] = await db.execute(`
            SELECT DISTINCT
                COALESCE(cc.name, 'General') AS id,
                COALESCE(cc.name, 'General') AS title,
                c.department AS businessUnit,
                COUNT(DISTINCT ca.id) AS totalCourses,
                SUM(CASE WHEN ca.status = 'completed' THEN 1 ELSE 0 END) AS completedCourses
            FROM course_assignments ca
            JOIN courses c ON ca.course_id = c.id
            LEFT JOIN course_categories cc ON c.category_id = cc.id
            WHERE ca.user_id = ? AND c.status = 'published'
            GROUP BY cc.name, c.department
            ORDER BY cc.name
        `, [req.user.userId]);

        // Transform to expected format
        const result = programs.map(p => ({
            id: p.id.toLowerCase().replace(/\s+/g, '-'),
            title: p.title,
            businessUnit: p.businessUnit || 'Primary Care',
            image: `https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800`,
            totalCourses: parseInt(p.totalCourses),
            completedCourses: parseInt(p.completedCourses),
            progressPercentage: p.totalCourses > 0 ? Math.round((p.completedCourses / p.totalCourses) * 100) : 0
        }));

        res.json(result);
    } catch (error) {
        console.error('Get programs error:', error);
        res.status(500).json({ error: 'Failed to fetch programs' });
    }
};

/**
 * GET /api/programs/:id
 * Get a specific program with its courses and lock status
 */
const getProgramById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Get courses in this program (category)
        const [courses] = await db.execute(`
            SELECT 
                ca.id AS assignment_id,
                ca.user_id,
                ca.course_id,
                ca.status,
                ca.assigned_at,
                ca.deadline_at,
                ca.completed_at,
                c.id,
                c.title,
                c.description,
                cc.name as category,
                c.department,
                c.version,
                c.deadline_days,
                TIMESTAMPDIFF(SECOND, NOW(), ca.deadline_at) AS seconds_remaining,
                CASE WHEN ca.deadline_at < NOW() AND ca.status != 'completed' THEN TRUE ELSE FALSE END AS is_overdue
            FROM course_assignments ca
            JOIN courses c ON ca.course_id = c.id
            LEFT JOIN course_categories cc ON c.category_id = cc.id
            WHERE ca.user_id = ? 
                AND c.status = 'published'
                AND LOWER(REPLACE(COALESCE(cc.name, 'General'), ' ', '-')) = ?
            ORDER BY ca.assigned_at ASC
        `, [userId, id]);

        if (courses.length === 0) {
            return res.status(404).json({ error: 'Program not found or no courses assigned' });
        }

        // Build program structure with lock logic
        const completedCourseIds = new Set(
            courses.filter(c => c.status === 'completed').map(c => c.course_id.toString())
        );

        const coursesWithLock = courses.map((course, index) => {
            // Lock logic: course is locked if previous course is not completed
            let isLocked = false;
            if (index > 0) {
                const prevCourse = courses[index - 1];
                if (prevCourse.status !== 'completed') {
                    isLocked = true;
                }
            }

            return {
                id: course.assignment_id.toString(),
                courseId: course.course_id.toString(),
                userId: course.user_id.toString(),
                status: course.is_overdue ? 'overdue' : course.status,
                assignedAt: course.assigned_at,
                deadline: course.deadline_at,
                completedAt: course.completed_at,
                secondsRemaining: Math.max(0, course.seconds_remaining || 0),
                isOverdue: !!course.is_overdue,
                isLocked,
                course: {
                    id: course.course_id.toString(),
                    title: course.title,
                    description: course.description,
                    category: course.category,
                    department: course.department,
                    version: course.version,
                    deadlineDays: course.deadline_days
                }
            };
        });

        const program = {
            id,
            title: courses[0].category || 'General',
            businessUnit: courses[0].department || 'Primary Care',
            courses: coursesWithLock
        };

        res.json(program);
    } catch (error) {
        console.error('Get program error:', error);
        res.status(500).json({ error: 'Failed to fetch program' });
    }
};

module.exports = { getMyPrograms, getProgramById };
