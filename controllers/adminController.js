// controllers/adminController.js
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const bcrypt = require('bcryptjs');

// GET /api/admin/users – list all users (password hash excluded)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/users – create a new user (admin can set role)
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, passwordHash, role: role || 'student' });
    await user.save();
    res.status(201).json({ message: 'User created', user: { id: user._id, name, email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/users/:id – delete a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/stats – overall system stats
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalLecturers = await User.countDocuments({ role: 'lecturer' });
    const totalCourses = await Course.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    res.json({ totalUsers, totalStudents, totalLecturers, totalCourses, totalLessons, totalEnrollments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};