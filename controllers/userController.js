// controllers/userController.js
const User = require('../models/User');
const Enrollment = require('../models/Enrollment'); // add this import

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    const user = req.user; // already populated by authMiddleware (lean)

    // Fetch enrollments for this user and populate course details
    const enrollments = await Enrollment.find({ student: user._id })
      .populate('course')
      .lean();

    // Map enrollments to the format expected by frontend
    const enrolledCourses = enrollments.map(e => ({
      id: e.course._id,
      title: e.course.title,
      level: e.course.level,
      description: e.course.description,
      instructor: e.course.lecturer, // you may need to populate lecturer later
      progress: e.progress || 0,
      enrolledDate: e.enrolledAt,
    }));

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
      level: user.level,
      badges: user.badges,
      mastery: user.mastery,
      profile: {
        department: user.department,
        learningStyle: user.learningStyle,
        studyTime: user.studyTime,
        enrolledCourses: enrolledCourses,
      },
      onboarded: user.onboarded,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/user/profile – update profile (e.g., onboarding, preferences)
exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    const allowed = ['department', 'learningStyle', 'studyTime', 'level', 'name', 'onboarded', 'office', 'coursesTaught'];
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    // handle lessonStyle as alias for learningStyle
    if (req.body.lessonStyle !== undefined) {
      updates.learningStyle = req.body.lessonStyle;
    }
    // handle coursesTaught as alias for coursesTaught
    // Map frontend's `courses` (array of strings) to `coursesTaught`
    if (req.body.courses !== undefined) {
      updates.coursesTaught = req.body.courses.filter(c => c && c.trim() !== '');
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    Object.assign(user, updates);
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
      level: user.level,
      badges: user.badges,
      mastery: user.mastery,
      department: user.department,
      learningStyle: user.learningStyle,
      studyTime: user.studyTime,
      onboarded: user.onboarded,
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/user/progress
exports.getProgress = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      points: user.points,
      level: user.level,
      badges: user.badges,
      mastery: user.mastery,
    });
  } catch (err) {
    console.error('getProgress error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};