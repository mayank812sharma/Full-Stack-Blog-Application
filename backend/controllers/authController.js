const User = require('../models/User');
const { createError } = require('../utils/apiError');
const { sendResponse } = require('../utils/apiResponse');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) return next(createError(409, 'Email already registered.'));
      return next(createError(409, 'Username already taken.'));
    }

    const user = await User.create({ name, username, email, password });
    const token = user.generateAuthToken();
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendResponse(res, 201, { token, user: user.toPublicJSON() }, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) return next(createError(401, 'Invalid email or password.'));
    if (!user.isActive) return next(createError(403, 'Account has been deactivated.'));

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return next(createError(401, 'Invalid email or password.'));

    const token = user.generateAuthToken();
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendResponse(res, 200, { token, user: user.toPublicJSON() }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('blogCount');
    sendResponse(res, 200, { user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return next(createError(400, 'Current password is incorrect.'));

    user.password = newPassword;
    await user.save();

    sendResponse(res, 200, {}, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};
