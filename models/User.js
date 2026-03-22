// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student','lecturer','admin'], default: 'student' },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  mastery: { type: Map, of: Number, default: {} },
  department: { type: String, default: 'Software Engineering' },
  learningStyle: { 
    type: String, 
    enum: ['Short & Quick', 'Detailed', 'Visual', 'Detailed & Deep'], 
    default: 'Short & Quick' 
  },
  studyTime: { 
    type: String, 
    enum: ['Morning', 'Afternoon', 'Night', 'Anytime'], 
    default: 'Night' 
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  onboarded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  office: { type: String, default: '' },
  coursesTaught: [{ type: String }]
});

module.exports = mongoose.model('User', userSchema);