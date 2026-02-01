const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validateRequest');

// Public routes
router.post('/login', validate(schemas.login), authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, authController.logout);
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
