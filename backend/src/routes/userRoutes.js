const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(requireRole('admin'));

// GET /api/users - List all learner users
router.get('/', userController.getAllLearners);

// GET /api/users/:id - Get single user details
router.get('/:id', userController.getUserById);

// POST /api/users - Create new learner user
router.post('/', userController.createUser);

// PUT /api/users/:id - Update user data
router.put('/:id', userController.updateUser);

// POST /api/users/:id/deactivate - Deactivate user
router.post('/:id/deactivate', userController.deactivateUser);

// POST /api/users/:id/reactivate - Reactivate user
router.post('/:id/reactivate', userController.reactivateUser);

// DELETE /api/users/:id - Soft delete user
router.delete('/:id', userController.deleteUser);

// POST /api/users/:id/reset-password - Reset user password
router.post('/:id/reset-password', userController.resetPassword);

// GET /api/users/:id/assignments - Get user's course assignments
router.get('/:id/assignments', userController.getUserAssignments);

// POST /api/users/id/assign-course - Assign course to user
router.post('/:id/assign-course', userController.assignCourse);

// POST /api/users/bulk-assign - Bulk assign courses to users
router.post('/bulk-assign', userController.bulkAssignCourses);

// DELETE /api/users/:id/assignments/:assignmentId - Remove course assignment
router.delete('/:id/assignments/:assignmentId', userController.unassignCourse);

module.exports = router;
