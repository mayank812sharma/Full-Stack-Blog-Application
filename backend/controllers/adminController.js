const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const Category = require('../models/Category');
const { sendResponse, parsePagination, getPaginationMeta } = require('../utils/apiResponse');
const { createError } = require('../utils/apiError');

// @desc  Dashboard stats
// @route GET /api/admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers, totalBlogs, totalComments, totalCategories,
      publishedBlogs, draftBlogs, recentUsers, recentBlogs,
    ] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      Comment.countDocuments({ isDeleted: false }),
      Category.countDocuments({ isActive: true }),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      User.find().sort('-createdAt').limit(5).select('name username avatar email createdAt role'),
      Blog.find({ status: 'published' }).sort('-createdAt').limit(5)
        .populate('author', 'name username')
        .populate('category', 'name')
        .select('title slug views likes createdAt'),
    ]);

    sendResponse(res, 200, {
      stats: {
        totalUsers, totalBlogs, totalComments, totalCategories,
        publishedBlogs, draftBlogs,
      },
      recentUsers,
      recentBlogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all users (admin)
// @route GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, role } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
    ];

    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(limit).select('-password'),
      User.countDocuments(filter),
    ]);

    sendResponse(res, 200, { users, pagination: getPaginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

// @desc  Toggle user active status
// @route PATCH /api/admin/users/:id/toggle-active
exports.toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(createError(404, 'User not found.'));
    if (user.role === 'admin') return next(createError(400, 'Cannot deactivate admin.'));

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    sendResponse(res, 200, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    next(error);
  }
};

// @desc  Update user role
// @route PATCH /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return next(createError(400, 'Invalid role.'));

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return next(createError(404, 'User not found.'));

    sendResponse(res, 200, { user }, 'Role updated');
  } catch (error) {
    next(error);
  }
};

// @desc  Get all blogs (admin)
// @route GET /api/admin/blogs
exports.getBlogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name username')
        .populate('category', 'name')
        .select('-content')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(filter),
    ]);

    sendResponse(res, 200, { blogs, pagination: getPaginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

// @desc  Toggle blog featured
// @route PATCH /api/admin/blogs/:id/feature
exports.toggleFeature = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(createError(404, 'Blog not found.'));
    blog.isFeatured = !blog.isFeatured;
    await blog.save();
    sendResponse(res, 200, { isFeatured: blog.isFeatured });
  } catch (error) {
    next(error);
  }
};

// @desc Delete blog (admin)
// @route DELETE /api/admin/blogs/:id
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return next(createError(404, 'Blog not found.'));
    await Comment.deleteMany({ blog: req.params.id });
    sendResponse(res, 200, {}, 'Blog deleted');
  } catch (error) {
    next(error);
  }
};
