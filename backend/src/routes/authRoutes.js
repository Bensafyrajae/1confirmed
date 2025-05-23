const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

// Routes publiques
router.post('/register', asyncHandler(AuthController.register));
router.post('/login', asyncHandler(AuthController.login));

// Routes protégées
router.get('/me', authMiddleware, asyncHandler(AuthController.me));
router.put('/profile', authMiddleware, asyncHandler(AuthController.updateProfile));
router.put('/password', authMiddleware, asyncHandler(AuthController.changePassword));
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;