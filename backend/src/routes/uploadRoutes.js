const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// Route: POST /api/upload
// Description: Upload a file (PDF, PPT, PPTX)
// Access: Admin only
router.post('/', authMiddleware, requireRole('admin'), upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Return file details
        // We return the relative path that can be accessed via the static middleware in server.js
        // Assuming server.js serves '/uploads' -> 'uploads/'
        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
            message: 'File uploaded successfully',
            url: fileUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

module.exports = router;
