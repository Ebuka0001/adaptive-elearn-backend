// routes/lecturer.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const lecturerController = require('../controllers/lecturerController');

router.get('/stats', auth, role(['lecturer']), lecturerController.getStats);
router.get('/courses', auth, role(['lecturer']), lecturerController.getMyCourses);

module.exports = router;