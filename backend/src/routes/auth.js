const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRequest, schemas } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Public routes
router.post('/register', 
  validateRequest(schemas.register),
  authController.register
);

router.post('/login', 
  validateRequest(schemas.login),
  authController.login
);

router.post('/refresh', 
  validateRequest(schemas.refreshToken),
  authController.refreshToken
);

// Protected routes
const { authenticateToken } = require('../middleware/auth');

router.post('/logout', 
  authenticateToken,
  authController.logout
);

router.get('/profile', 
  authenticateToken,
  authController.getProfile
);

router.put('/profile', 
  authenticateToken,
  // Add validation for profile update
  validateRequest(schemas.updateProfile),
  authController.updateProfile
);

router.put('/change-password', 
  authenticateToken,
  validateRequest(schemas.changePassword),
  authController.changePassword
);

module.exports = router;