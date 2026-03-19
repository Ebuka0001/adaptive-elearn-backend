// controllers/enrollmentController.js
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

exports.enroll = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existing) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    const enrollment = new Enrollment({
      student: studentId,
      course: courseId,
      progress: 0
    });
    await enrollment.save();

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (err) {
    console.error('enroll error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate('course')
      .lean();
    res.json(enrollments);
  } catch (err) {
    console.error('getMyEnrollments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// (Optional) GET /api/courses/:courseId/enrollment-status – check if student enrolled
exports.getEnrollmentStatus = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId
    });
    res.json({ enrolled: !!enrollment });
  } catch (err) {
    console.error('getEnrollmentStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};