const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const user = await User.findByPk(decoded.sub);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Optional authentication (for demo mode)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.sub);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignore errors in optional auth, just proceed without user
    next();
  }
};

// Check if user owns resource
const checkResourceOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.body[resourceUserIdField] || 
                          req.params[resourceUserIdField] || 
                          req.query[resourceUserIdField];

    if (resourceUserId && resourceUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  checkResourceOwnership
};