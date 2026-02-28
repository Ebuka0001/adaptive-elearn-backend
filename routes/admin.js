// routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(auth, admin);

router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/stats', adminController.getSystemStats);

module.exports = router;