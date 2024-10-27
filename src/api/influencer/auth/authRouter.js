// routes/auth.js
const express = require('express');
const router = express.Router();
const AuthController = require('./authController');
const authMiddleware = require('../../../middleware/authMiddleware.js'); // Import the middleware

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', authMiddleware, AuthController.me); // Protect the /me route

router.post('/add-portfolio', authMiddleware, AuthController.addPortfolio); // Protect this route
router.get('/view-portfolio', authMiddleware, AuthController.viewPortfolio); // Protect this route


module.exports = router;
