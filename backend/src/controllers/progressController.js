const db = require('../config/database');

/**
 * GET /api/progress/:assignmentId
 * Get progress for a specific course assignment
 */
const getProgress = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        // Verify assignment belongs to user
        const [assignmentRows] = await db.execute(
            'SELECT * FROM course_assignments WHERE id = ? AND user_id = ?',
            [assignmentId, req.user.userId]
        );

        if (assignmentRows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        const assignment = assignmentRows[0];
        const courseId = assignment.course_id;

        // Get all chapters for the course
        const [chapters] = await db.execute(
            'SELECT id, title, order_index, type, content_data FROM course_chapters WHERE course_id = ? ORDER BY order_index',
            [courseId]
        );

        // Get progress for these chapters
        // Left Join ensures we get all chapters even if no progress
        const [progressRows] = await db.execute(`
            SELECT 
                cp.*,
                ch.id as chapter_id,
                ch.title as chapter_title,
                ch.type as chapter_type
            FROM course_chapters ch
            LEFT JOIN course_progress cp ON ch.id = cp.chapter_id AND cp.assignment_id = ?
            WHERE ch.course_id = ?
            ORDER BY ch.order_index
        `, [assignmentId, courseId]);

        // Get saved quiz answers
        const [quizAnswers] = await db.execute(
            'SELECT * FROM chapter_quiz_answers WHERE assignment_id = ?',
            [assignmentId]
        );

        const totalChapters = chapters.length;
        const completedCount = progressRows.filter(p => p.is_completed).length;

        // Calculate overall percentage
        const overallPercentage = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

        res.json({
            assignmentId,
            overallPercentage,
            completedItems: completedCount,
            totalItems: totalChapters,
            canComplete: completedCount === totalChapters,
            items: progressRows.map(p => {
                // Determine completion logic per type if needed, but DB is_completed is single source of truth
                // For slides, we might want to send total pages from content_data
                let totalPages = 0;
                if (p.chapter_type === 'slide' || p.chapter_type === 'pdf') {
                    // Try parsing content_data to find total pages if stored there? 
                    // Currently schema says content_data is JSON. 
                    // Assuming frontend sends completion status update explicitly.
                }

                // Attach answers if this is a quiz
                const chapterAnswers = p.chapter_type === 'quiz'
                    ? quizAnswers
                        .filter(a => a.chapter_id === p.chapter_id)
                        .map(a => ({
                            questionIndex: a.question_index,
                            selectedOptionIndex: a.selected_option_index,
                            isCorrect: !!a.is_correct
                        }))
                    : [];

                return {
                    chapterId: p.chapter_id.toString(),
                    title: p.chapter_title,
                    type: p.chapter_type,
                    currentPage: p.current_page || 0,
                    isCompleted: !!p.is_completed,
                    timeSpentSeconds: p.time_spent_seconds || 0,
                    lastViewedAt: p.last_viewed_at,
                    answers: chapterAnswers.length > 0 ? chapterAnswers : undefined
                };
            })
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
};

/**
 * POST /api/progress/:assignmentId
 * Update progress for a chapter
 */
const updateProgress = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { chapterId, currentPage, timeSpentSeconds } = req.body;
        console.log('UpdateProgress Payload:', JSON.stringify(req.body, null, 2));

        // Verify assignment belongs to user
        const [assignmentRows] = await db.execute(
            'SELECT ca.* FROM course_assignments ca WHERE ca.id = ? AND ca.user_id = ?',
            [assignmentId, req.user.userId]
        );

        if (assignmentRows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        const assignment = assignmentRows[0];

        // Verify chapter belongs to course of assignment
        const [chapterRows] = await db.execute(
            'SELECT * FROM course_chapters WHERE id = ? AND course_id = ?',
            [chapterId, assignment.course_id]
        );

        if (chapterRows.length === 0) {
            return res.status(404).json({ error: 'Chapter does not belong to this course' });
        }

        // Check if progress record exists
        const [existingProgress] = await db.execute(
            'SELECT * FROM course_progress WHERE assignment_id = ? AND chapter_id = ?',
            [assignmentId, chapterId]
        );

        // Determine completion
        // For video/slides, frontend triggers completion event usually.
        // We will assume if currentPage is high, or explicitly sent 'isCompleted' (not in schema yet, but implied logic)
        // Actually, the frontend calls 'updateChapterProgress' with status='completed'. 
        // But our API endpoint implementation currently just takes numbers. 
        // Let's IMPROVE the API to accept 'status' or 'isCompleted' boolean if we want explicit completion.
        // The current validateRequest expects number. Let's assume logic:

        // Wait, the previous controller logic had "isCompleted = totalPagesViewed >= totalPages". 
        // New logic: Simple override. If frontend calls this updates, we update. 
        // BUT, we need to know if it is completed.
        // Let's assume the frontend sends a separate 'completeAssignment' call? No, that's for the WHOLE course.

        // For now, let's keep it simple: if timeSpent > 0, it means we are tracking. 
        // Only mark completed if the user calls a specific "complete chapter" endpoint?
        // Or we can add `isCompleted` to the request body. 
        // The Plan said: "Refactor updateProgress to update based on chapterId".
        // The schema in validateRequest doesn't have `isCompleted`. 
        // I will add code to assume if specific criteria met or maybe add it to schema?
        // Let's stick to the current schema for now but consider `currentPage` logic.
        // Actually, for Video, currentPage could be seconds watched? 
        // For slides, it is page number.

        // Let's Auto-Complete for testing purposes if timeSpent > 10s or similar? 
        // NO, we want explicit control.
        // I will modify validateRequest to accept `isCompleted` boolean as optional.
        // And use it here.

        // For this step, I'll use `isCompleted` if present in body (need to update schema next step or trust Joi stripUnknown=true if I didn't set it)
        // Wait, Joi stripUnknown is true. So I cannot use it unless I add it to schema.
        // I will add `isCompleted` to schema in next step (or previous parallel tool call).
        // Actually I already replaced validateRequest schema... I missed `isCompleted`.
        // I will fix validateRequest in a follow up or assume `currentPage` == -1 means complete? 
        // No, that's hacky.

        // Let's rely on `currentPage` being passed. 
        // Note: The frontend checks `status === 'completed'`.
        // The previous backend logic derived `isCompleted`.
        // I will assume for now that if we get an update, it is NOT completed unless we implement logic.
        // Let's change the logic: IF currentPage == -1 OR some flag.

        // BETTER: I will assume the `updateChapterProgress` in frontend sends specific data.
        // The frontend sends `updateChapterProgress(..., 'completed', score)`.
        // I should probably add `isCompleted` to the Request Body in `validateRequest`.


        let isCompleted = false;
        // Logic: if totalPagesViewed is passed and equals something?
        // Let's Update this later correctly. For now, simply update the values.

        // ! CRITICAL: Adding isCompleted handling.
        // I'll grab it from req.body even if Joi strips it? No, Joi strips it.
        // I will update Joi schema in next turn if needed.
        // For now, let's assume `currentPage` updates.

        if (existingProgress.length > 0) {
            await db.execute(`
                UPDATE course_progress 
                SET current_page = ?,
                    time_spent_seconds = time_spent_seconds + ?,
                    last_viewed_at = NOW()
                WHERE assignment_id = ? AND chapter_id = ?
            `, [currentPage, timeSpentSeconds || 0, assignmentId, chapterId]);
        } else {
            await db.execute(`
                INSERT INTO course_progress (assignment_id, chapter_id, current_page, time_spent_seconds, last_viewed_at)
                VALUES (?, ?, ?, ?, NOW())
            `, [assignmentId, chapterId, currentPage, timeSpentSeconds || 0]);
        }

        // Handle Quiz Answers if present
        if (req.body.answers && Array.isArray(req.body.answers)) {
            const answers = req.body.answers;
            // First clear existing answers for this attempt (simplest approach for now, or use ON DUPLICATE KEY UPDATE logic per question)
            // But since this is a "submit", we can wipe and replace or just insert.
            // Let's delete old answers for this assignment+chapter to avoid duplicates if re-submitted (though usually not allowed).
            await db.execute('DELETE FROM chapter_quiz_answers WHERE assignment_id = ? AND chapter_id = ?', [assignmentId, chapterId]);

            for (const ans of answers) {
                await db.execute(`
                   INSERT INTO chapter_quiz_answers 
                   (assignment_id, chapter_id, question_index, selected_option_index, is_correct)
                   VALUES (?, ?, ?, ?, ?)
               `, [assignmentId, chapterId, ans.questionIndex, ans.selectedOptionIndex, ans.isCorrect]);
            }
        }

        // Update assignment last_access_at and status
        let newStatus = assignment.status;
        if (assignment.status === 'not_started') {
            newStatus = 'in_progress';
        }

        await db.execute(
            'UPDATE course_assignments SET last_access_at = NOW(), status = ? WHERE id = ?',
            [newStatus, assignmentId]
        );

        res.json({
            success: true,
            chapterId,
            currentPage,
            assignmentStatus: newStatus
        });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
};

/**
 * POST /api/progress/:assignmentId/chapters/:chapterId/complete
 * Mark a specific chapter as completed
 */
const completeChapter = async (req, res) => {
    try {
        const { assignmentId, chapterId } = req.params;

        // Verify assignment
        const [assignmentRows] = await db.execute(
            'SELECT * FROM course_assignments WHERE id = ? AND user_id = ?',
            [assignmentId, req.user.userId]
        );

        if (assignmentRows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Upsert progress with is_completed = true
        // Check existence
        const [existing] = await db.execute(
            'SELECT id FROM course_progress WHERE assignment_id = ? AND chapter_id = ?',
            [assignmentId, chapterId]
        );

        if (existing.length > 0) {
            await db.execute(
                'UPDATE course_progress SET is_completed = TRUE, last_viewed_at = NOW() WHERE id = ?',
                [existing[0].id]
            );
        } else {
            await db.execute(
                'INSERT INTO course_progress (assignment_id, chapter_id, is_completed, last_viewed_at) VALUES (?, ?, TRUE, NOW())',
                [assignmentId, chapterId]
            );
        }

        res.json({ success: true, message: 'Chapter marked as completed' });

    } catch (error) {
        console.error('Complete chapter error:', error);
        res.status(500).json({ error: 'Failed to complete chapter' });
    }
}


/**
 * POST /api/progress/:assignmentId/complete
 * Mark assignment as completed (only if all chapters completed)
 */
const completeAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        // Verify assignment belongs to user
        const [assignmentRows] = await db.execute(
            'SELECT * FROM course_assignments WHERE id = ? AND user_id = ?',
            [assignmentId, req.user.userId]
        );

        if (assignmentRows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        const assignment = assignmentRows[0];
        const courseId = assignment.course_id;

        // Check total chapters
        const [chapters] = await db.execute(
            'SELECT COUNT(*) as count FROM course_chapters WHERE course_id = ?',
            [courseId]
        );
        const totalChapters = chapters[0].count;

        // Check completed chapters
        const [completed] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM course_progress cp
            JOIN course_chapters cc ON cp.chapter_id = cc.id
            WHERE cp.assignment_id = ? AND cp.is_completed = TRUE AND cc.course_id = ?
        `, [assignmentId, courseId]);

        const completedCount = completed[0].count;

        if (completedCount < totalChapters) {
            return res.status(400).json({
                error: 'Cannot complete course until all chapters are completed',
                completed: completedCount,
                total: totalChapters
            });
        }

        // Mark as completed
        await db.execute(
            'UPDATE course_assignments SET status = "completed", completed_at = NOW() WHERE id = ?',
            [assignmentId]
        );

        res.json({
            success: true,
            message: 'Course completed successfully',
            completedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Complete assignment error:', error);
        res.status(500).json({ error: 'Failed to complete course' });
    }
};

module.exports = { getProgress, updateProgress, completeAssignment, completeChapter };
