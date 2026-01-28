const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validateRequest');

// All routes require authentication
router.use(authMiddleware);

// Progress routes
router.get('/:assignmentId', progressController.getProgress);
router.post('/:assignmentId', validate(schemas.progressUpdate), progressController.updateProgress);
router.post('/:assignmentId/chapters/:chapterId/complete', progressController.completeChapter);
router.post('/:assignmentId/complete', progressController.completeAssignment);

module.exports = router;
