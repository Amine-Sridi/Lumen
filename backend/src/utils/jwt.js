const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT access token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      type: 'access'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      issuer: 'lumen-api',
      audience: 'lumen-app'
    }
  );
};

// Generate JWT refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      type: 'refresh',
      jti: crypto.randomUUID() // Unique ID for token
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      issuer: 'lumen-api',
      audience: 'lumen-app'
    }
  );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

// Generate both tokens
const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  };
};

// Extract token from authorization header
const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

// Validate token format
const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // JWT tokens have 3 parts separated by dots
  const parts = token.split('.');
  return parts.length === 3;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateTokens,
  extractToken,
  isValidTokenFormat
};