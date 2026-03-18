// controllers/userController.js
const User = require('../models/User');

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
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
    console.error('getProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/user/profile – update profile (e.g., onboarding, preferences)
exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    const allowed = ['department', 'learningStyle', 'studyTime', 'level', 'name', 'onboarded'];
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    // handle lessonStyle as alias for learningStyle
    if (req.body.lessonStyle !== undefined) {
      updates.learningStyle = req.body.lessonStyle;
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
    console.error('updateProfile error:', err); // This will print the full error in backend terminal
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