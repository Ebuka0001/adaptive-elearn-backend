// controllers/lessonController.js
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

exports.createLesson = async (req, res) => {
  const { title, content, courseId, concepts, order } = req.body;
  try {
    const lesson = new Lesson({ title, content, course: courseId, concepts, order });
    await lesson.save();
    await Course.findByIdAndUpdate(courseId, { $push: { lessons: lesson._id } });
    res.json(lesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId })
      .populate('questions')
      .lean();
    // For students, strip answers from questions
    if (req.user.role === 'student') {
      lessons.forEach(lesson => {
        lesson.questions = lesson.questions.map(q => {
          const safeQ = { ...q };
          safeQ.answer = undefined;
          if (safeQ.choices) safeQ.choices = safeQ.choices.map(c => ({ text: c.text }));
          return safeQ;
        });
      });
    }
    res.json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// NEW: Get a single lesson by ID
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('questions')
      .lean();
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    if (req.user.role === 'student') {
      lesson.questions = lesson.questions.map(q => {
        const safeQ = { ...q };
        safeQ.answer = undefined;
        if (safeQ.choices) safeQ.choices = safeQ.choices.map(c => ({ text: c.text }));
        return safeQ;
      });
    }
    res.json(lesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};