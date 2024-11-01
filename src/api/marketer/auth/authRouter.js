const express = require('express');
const router = express.Router();
const AuthController = require('./authController');
const authMiddleware = require('../../../middleware/authMiddleware.js'); // Import the middleware

////////////////

// Register route
router.post('/register', AuthController.register);

// Login route
router.post('/login', AuthController.login);

// Get logged-in marketer profile (Protected route)
router.get('/me', authMiddleware, AuthController.getMe);

module.exports = router;
