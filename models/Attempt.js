const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  correct: { type: Boolean, default: false },
  givenAnswer: { type: String, default: '' },
  pointsEarned: { type: Number, default: 0 },
  // optional idempotency key to help dedupe duplicate requests
  idempotencyKey: { type: String, index: true, sparse: true },
}, { timestamps: true });

module.exports = mongoose.model('Attempt', AttemptSchema);
