// routes/user.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile); // uncomment if needed

router.get('/progress', auth, userController.getProgress);

module.exports = router;