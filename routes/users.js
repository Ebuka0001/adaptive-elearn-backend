// routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.post('/onboarding', auth, async (req, res) => {
  try {
    // The frontend sends { onboardingData, xpEarned } as one object
    // We'll merge and add onboarded flag
    const data = req.body;
    data.onboarded = true;
    req.body = data;
    await userController.updateProfile(req, res);
  } catch (error) {
    console.error('Onboarding route error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile', auth, userController.getProfile);

module.exports = router;