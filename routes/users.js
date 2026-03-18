// routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// POST /api/users/onboarding – called by frontend after onboarding
// The frontend sends { ...profileData, xpEarned }
router.post('/onboarding', auth, async (req, res) => {
  try {
    // The frontend expects to update the user's profile with onboarding data
    // and possibly handle xpEarned. We'll just forward to updateProfile.
    // We'll also ensure the user is marked as onboarded.
    const onboardingData = req.body;
    // Add onboarded flag
    onboardingData.onboarded = true;
    // Call the existing updateProfile controller
    // We need to adapt because updateProfile expects the fields directly in req.body
    req.body = onboardingData;
    await userController.updateProfile(req, res);
  } catch (error) {
    console.error('Onboarding route error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/profile – get user profile (alias to your /user/profile)
router.get('/profile', auth, userController.getProfile);

module.exports = router;