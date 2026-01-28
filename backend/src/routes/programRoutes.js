const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Program routes
router.get('/', programController.getMyPrograms);
router.get('/:id', programController.getProgramById);

module.exports = router;
