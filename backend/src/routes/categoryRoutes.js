const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware: authenticateToken, requireRole: authorizeRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Admin only routes
router.get('/', categoryController.getAllCategories); // Learners might need this too? For now admin.
router.post('/', authorizeRole('admin'), categoryController.createCategory);
router.put('/reorder', authorizeRole('admin'), categoryController.reorderCategories);
router.put('/:id', authorizeRole('admin'), categoryController.updateCategory);
router.delete('/:id', authorizeRole('admin'), categoryController.deleteCategory);

module.exports = router;
