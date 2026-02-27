// controllers/courseController.js
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.createCourse = async (req, res) => {
  const { title, description, level, duration } = req.body;
  try {
    const course = new Course({
      title,
      description,
      level: level || '100',
      duration: duration || '6 weeks',
      lecturer: req.user._id
    });
    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listCourses = async (req, res) => {
  try {
    let courses = await Course.find().populate('lecturer', 'name email').lean();
    // If user is a student, add enrollment status
    if (req.user.role === 'student') {
      const enrollments = await Enrollment.find({ student: req.user._id }).select('course');
      const enrolledSet = new Set(enrollments.map(e => e.course.toString()));
      courses = courses.map(c => ({
        ...c,
        isEnrolled: enrolledSet.has(c._id.toString())
      }));
    }
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('lecturer', 'name email')
      .populate({
        path: 'lessons',
        populate: { path: 'questions' }  // includes full question objects
      })
      .lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // For students, strip answers from questions
    if (req.user.role === 'student') {
      course.lessons = course.lessons.map(lesson => ({
        ...lesson,
        questions: lesson.questions.map(q => {
          // remove correct flag from choices, remove answer field
          const safeQ = { ...q };
          safeQ.answer = undefined;
          if (safeQ.choices) {
            safeQ.choices = safeQ.choices.map(c => ({ text: c.text })); // keep only text
          }
          return safeQ;
        })
      }));
    }

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};