const User = require('../models/User');
const Blog = require('../models/Blog');
const { createError } = require('../utils/apiError');
const { sendResponse, parsePagination, getPaginationMeta } = require('../utils/apiResponse');

// @desc Get user public profile
// @route GET /api/users/:username
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username, isActive: true })
      .select('-password -savedBlogs -resetPasswordToken -resetPasswordExpire');
    if (!user) return next(createError(404, 'User not found.'));

    const blogs = await Blog.find({ author: user._id, status: 'published' })
      .populate('category', 'name slug color')
      .select('-content')
      .sort('-createdAt')
      .limit(10)
      .lean();

    sendResponse(res, 200, { user, blogs });
  } catch (error) {
    next(error);
  }
};

// @desc Update current user profile
// @route PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'bio', 'website', 'avatar', 'social'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    sendResponse(res, 200, { user: user.toPublicJSON() }, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

// @desc Get saved blogs
// @route GET /api/users/saved
exports.getSavedBlogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const user = await User.findById(req.user._id).select('savedBlogs');

    const [blogs, total] = await Promise.all([
      Blog.find({ _id: { $in: user.savedBlogs }, status: 'published' })
        .populate('author', 'name username avatar')
        .populate('category', 'name slug color')
        .select('-content')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments({ _id: { $in: user.savedBlogs }, status: 'published' }),
    ]);

    sendResponse(res, 200, { blogs, pagination: getPaginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

// @desc Follow/Unfollow user
// @route POST /api/users/:id/follow
exports.toggleFollow = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return next(createError(400, 'You cannot follow yourself.'));
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return next(createError(404, 'User not found.'));

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      currentUser.following.pull(req.params.id);
      targetUser.followers.pull(req.user._id);
    } else {
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user._id);
    }

    await Promise.all([
      currentUser.save({ validateBeforeSave: false }),
      targetUser.save({ validateBeforeSave: false }),
    ]);

    sendResponse(res, 200, { following: !isFollowing });
  } catch (error) {
    next(error);
  }
};
