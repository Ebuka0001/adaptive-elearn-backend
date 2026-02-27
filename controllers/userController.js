// controllers/userController.js
const User = require('../models/User');

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    // req.user already populated by authMiddleware (full user document)
    const user = req.user;

    // You may want to remove sensitive fields, but passwordHash is already excluded
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
      level: user.level,
      badges: user.badges,
      mastery: user.mastery,
      // add any preferences later (e.g., learningStyle, studyTime)
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// (Optional) PUT /api/user/profile – to update preferences
exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    // only allow certain fields to be updated
    const allowed = ['name', 'learningStyle', 'studyTime']; // extend as needed
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    // Note: your User model currently doesn't have learningStyle or studyTime.
    // If needed, add them to the model (optional fields). For now, skip.
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/user/progress
exports.getProgress = async (req, res) => {
  try {
    const user = req.user;
    // Compute additional stats if needed, e.g., total attempts, correct ratio.
    // For now, return what we have.
    res.json({
      points: user.points,
      level: user.level,
      badges: user.badges,
      mastery: user.mastery,
      // You could also fetch attempt counts from Attempt model
    });
  } catch (err) {
    console.error('getProgress error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};