// routes/enrollment.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const enrollmentController = require('../controllers/enrollmentController');

router.post('/courses/:courseId/enroll', auth, role(['student']), enrollmentController.enroll);
router.get('/my-enrollments', auth, role(['student']), enrollmentController.getMyEnrollments);
router.get('/courses/:courseId/status', auth, role(['student']), enrollmentController.getEnrollmentStatus);

module.exports = router;