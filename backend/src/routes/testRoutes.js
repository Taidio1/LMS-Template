const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Check if verifyToken is the correct middleware name from existing codebase
// Usage: router.get('/:id', verifyToken, testController.getTest);

// Public/Protected routes
// Public/Protected routes
router.post('/', authMiddleware, testController.createTest); // Helper for Builder
router.post('/assign', authMiddleware, testController.assignTest); // Direct assignment
router.get('/', authMiddleware, testController.listTests);
router.get('/learner', authMiddleware, testController.getLearnerTests); // New endpoint for learner tests
router.get('/:id', authMiddleware, testController.getTest);

router.get('/results', authMiddleware, testController.getTestResults);
router.post('/attempt/start', authMiddleware, testController.startAttempt);
router.post('/attempt/:attemptId/finalize', authMiddleware, testController.finalizeAttempt);
router.post('/attempt/:attemptId/save', authMiddleware, testController.saveProgress);

module.exports = router;
