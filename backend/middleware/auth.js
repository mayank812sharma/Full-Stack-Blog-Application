const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createError } = require('../utils/apiError');

// Protect routes - verify JWT
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(createError(401, 'Access denied. No token provided.'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check user still exists and is active
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(createError(401, 'User no longer exists.'));
    }

    if (!user.isActive) {
      return next(createError(403, 'Your account has been deactivated.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(createError(401, 'Invalid token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(createError(401, 'Token expired. Please login again.'));
    }
    next(error);
  }
};

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) req.user = user;
    }
    next();
  } catch {
    next(); // silently fail
  }
};

// Role-based authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, 'Authentication required.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(createError(403, `Access denied. Required role: ${roles.join(' or ')}.`));
    }
    next();
  };
};
