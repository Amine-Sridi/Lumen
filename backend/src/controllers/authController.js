const { User } = require('../models');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');

// Register new user
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, businessName, businessType, businessAddress } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      businessName,
      businessType,
      businessAddress
    });

    // Generate tokens
    const tokens = generateTokens(user);

    // Store refresh token
    await user.update({ refreshToken: tokens.refreshToken });

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: tokens.tokenType,
        expiresIn: tokens.expiresIn
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Store refresh token and update last login
    await user.update({ 
      refreshToken: tokens.refreshToken,
      lastLoginAt: new Date()
    });

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: tokens.tokenType,
        expiresIn: tokens.expiresIn
      },
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

// Refresh access token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Find user and validate stored refresh token
    const user = await User.findByPk(decoded.sub);
    if (!user || !user.isActive || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Store new refresh token
    await user.update({ refreshToken: tokens.refreshToken });

    res.json({
      success: true,
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: tokens.tokenType,
        expiresIn: tokens.expiresIn
      },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
const logout = async (req, res, next) => {
  try {
    const user = req.user;

    // Clear refresh token
    await user.update({ refreshToken: null });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: user.toJSON(),
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { firstName, lastName, phone, businessName, businessType, businessAddress } = req.body;

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone !== undefined ? phone : user.phone,
      businessName: businessName !== undefined ? businessName : user.businessName,
      businessType: businessType !== undefined ? businessType : user.businessType,
      businessAddress: businessAddress !== undefined ? businessAddress : user.businessAddress
    });

    res.json({
      success: true,
      data: user.toJSON(),
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    // Validate current password
    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }

    // Update password
    await user.update({ password: newPassword });

    // Clear all refresh tokens for security
    await user.update({ refreshToken: null });

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword
};