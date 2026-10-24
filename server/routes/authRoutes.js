const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected route example (requires authentication)
router.get('/me', authMiddleware, (req, res) => {
    res.json({ message: 'Authenticated route accessed', userId: req.user.id });
});

module.exports = router;