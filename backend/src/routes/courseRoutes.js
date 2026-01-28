const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Learner routes
router.get('/my-courses', courseController.getMyCourses);
router.get('/:id', courseController.getCourseById);

// Admin routes
router.get('/', requireRole('admin'), courseController.getAllCourses);
router.post('/', requireRole('admin'), courseController.createCourse);
router.put('/:id', requireRole('admin'), courseController.updateCourse);
router.put('/:id/chapters', requireRole('admin'), courseController.updateChapters);
router.delete('/:id', requireRole('admin'), courseController.deleteCourse);
router.post('/:id/publish', requireRole('admin'), courseController.publishCourse);
router.post('/:id/archive', requireRole('admin'), courseController.archiveCourse);

module.exports = router;
