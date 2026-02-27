// controllers/lecturerController.js
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const Lesson = require('../models/Lesson');   // <-- added this line

// GET /api/lecturer/stats
exports.getStats = async (req, res) => {
  try {
    const lecturerId = req.user._id;

    // Courses created by this lecturer
    const courses = await Course.find({ lecturer: lecturerId }).select('_id');
    const courseIds = courses.map(c => c._id);
    const totalCourses = courseIds.length;

    // Total students enrolled in any of these courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } }).distinct('student');
    const totalStudents = enrollments.length;

    // Total assignments (questions) created by this lecturer (questions in lessons of his courses)
    // First get all lessons of these courses
    const lessons = await Lesson.find({ course: { $in: courseIds } }).select('_id');
    const lessonIds = lessons.map(l => l._id);
    const totalAssignments = await Question.countDocuments({ lesson: { $in: lessonIds } });

    // Total XP awarded to students from attempts on these questions
    const attempts = await Attempt.aggregate([
      { $lookup: { from: 'questions', localField: 'question', foreignField: '_id', as: 'q' } },
      { $unwind: '$q' },
      { $lookup: { from: 'lessons', localField: 'q.lesson', foreignField: '_id', as: 'l' } },
      { $unwind: '$l' },
      { $match: { 'l.course': { $in: courseIds } } },
      { $group: { _id: null, totalXP: { $sum: '$pointsEarned' } } }
    ]);
    const totalXP = attempts[0]?.totalXP || 0;

    res.json({
      totalStudents,
      totalCourses,
      totalAssignments,
      totalXP
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/lecturer/courses – get lecturer's courses with enrollment counts
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ lecturer: req.user._id }).lean();
    const courseIds = courses.map(c => c._id);
    const enrollCounts = await Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: '$course', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    enrollCounts.forEach(item => { countMap[item._id] = item.count; });

    const result = courses.map(c => ({
      ...c,
      enrolledStudents: countMap[c._id] || 0
    }));
    res.json(result);
  } catch (err) {
    console.error('getMyCourses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};