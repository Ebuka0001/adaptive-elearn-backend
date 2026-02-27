const mongoose = require("mongoose");
const Attempt = require("../models/Attempt");
const Question = require("../models/Question");
const User = require("../models/User");
const adaptiveService = require("../services/adaptiveService");
const badgeService = require("../services/badgeService");

/**
 * Submit attempt (idempotent when Idempotency-Key header provided)
 * Body: { questionId, givenAnswer, timeSeconds? }
 */
exports.submitAttempt = async (req, res) => {
  const { questionId, givenAnswer } = req.body;

  try {
    // Basic validation
    if (!questionId) return res.status(400).json({ message: "questionId is required" });
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "questionId is not a valid id" });
    }

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    // Evaluate correctness (unchanged logic)
    let correct = false;
    if (question.type === "mcq") {
      const correctChoice = (question.choices || []).find((c) => c.correct);
      correct = !!(correctChoice && correctChoice.text === givenAnswer);
    } else {
      correct =
        String(question.answer || "").trim().toLowerCase() ===
        String(givenAnswer || "").trim().toLowerCase();
    }

    const pointsEarned = correct ? (question.points || 0) : 0;

    // Idempotency header (optional)
    const idemKey = req.header("Idempotency-Key") || req.header("idempotency-key");

    if (idemKey) {
      // atomic upsert: create attempt only if one with same idempotencyKey + student doesn't exist
      const filter = { idempotencyKey: idemKey, student: req.user._id };
      const toInsert = {
        student: req.user._id,
        question: question._id,
        correct,
        givenAnswer,
        pointsEarned,
        idempotencyKey: idemKey,
      };

      // Use rawResult to detect whether we inserted or found existing
      const raw = await Attempt.findOneAndUpdate(
        filter,
        { $setOnInsert: toInsert },
        { upsert: true, new: true, setDefaultsOnInsert: true, includeResultMetadata: true }
      );

      const attemptDoc = raw.value;
      const wasInserted = raw.lastErrorObject && raw.lastErrorObject.upserted;

      // If we inserted now, perform user updates once
      const user = await User.findById(req.user._id);
      if (!user) return res.status(500).json({ message: "User not found when updating after attempt" });

      if (wasInserted) {
        // update points and level if applicable
        if (pointsEarned) {
          user.points = (user.points || 0) + pointsEarned;
          user.level = Math.floor(user.points / 100) + 1;
        }

        // Update mastery and badges
        try {
          await adaptiveService.updateMastery(user, question.concepts || [], correct, question.difficulty || 1);
        } catch (mErr) {
          console.error("updateMastery error (non-fatal):", mErr && mErr.message ? mErr.message : mErr);
        }

        try {
          const awarded = await badgeService.checkBadges(user);
          // badgeService may mutate user.badges
        } catch (bErr) {
          console.error("badgeService.checkBadges error (non-fatal):", bErr && bErr.message ? bErr.message : bErr);
        }

        await user.save();
      } else {
        // Not inserted: existing attempt found — return it, but fetch fresh user state
      }

      // return existing/inserted attempt and fresh user data
      const freshUser = await User.findById(req.user._id);
      return res.json({
        attempt: attemptDoc,
        user: { id: freshUser._id, name: freshUser.name, points: freshUser.points, level: freshUser.level, mastery: freshUser.mastery, badges: freshUser.badges },
      });
    }

    // No idempotency key: normal (non-atomic) flow (existing behavior)
    const attempt = new Attempt({
      student: req.user._id,
      question: question._id,
      correct,
      givenAnswer,
      pointsEarned,
    });
    await attempt.save();

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(500).json({ message: "User not found when updating after attempt" });
    }

    if (pointsEarned) {
      user.points = (user.points || 0) + pointsEarned;
      user.level = Math.floor(user.points / 100) + 1;
    }

    try {
      await adaptiveService.updateMastery(user, question.concepts || [], correct, question.difficulty || 1);
    } catch (mErr) {
      console.error("updateMastery error (non-fatal):", mErr && mErr.message ? mErr.message : mErr);
    }

    try {
      const awarded = await badgeService.checkBadges(user);
    } catch (bErr) {
      console.error("badgeService.checkBadges error (non-fatal):", bErr && bErr.message ? bErr.message : bErr);
    }

    await user.save();

    return res.json({ attempt, user: { id: user._id, name: user.name, points: user.points, level: user.level, mastery: user.mastery, badges: user.badges } });
  } catch (err) {
    console.error("submitAttempt error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getAttemptsForStudent = async (req, res) => {
  try {
    const attempts = await Attempt.find({ student: req.params.studentId }).populate('question');
    res.json(attempts);
  } catch (err) {
    console.error('getAttemptsForStudent error:', err && err.stack ? err.stack : err);
    res.status(500).json({ message: 'Server error' });
  }
};
