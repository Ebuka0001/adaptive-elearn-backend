// routes/upload.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

// Only lecturers can upload
router.post('/lesson/:lessonId', auth, role(['lecturer']), upload.single('pdf'), uploadController.uploadLessonFile);

module.exports = router;