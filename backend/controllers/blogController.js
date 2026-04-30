const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { createError } = require('../utils/apiError');
const { sendResponse, parsePagination, getPaginationMeta } = require('../utils/apiResponse');

// ─── Public: Get all published blogs ─────────────────────────────────────────
exports.getBlogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { category, tag, search, sort = '-createdAt', author } = req.query;

    const filter = { status: 'published' };
    if (category) filter.category = category;
    if (tag) filter.tags = tag.toLowerCase();
    if (author) filter.author = author;
    if (search) {
      filter.$text = { $search: search };
    }

    const sortObj = {};
    if (search) {
      sortObj.score = { $meta: 'textScore' };
    }
    // parse sort string like '-createdAt' or 'views'
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDir = sort.startsWith('-') ? -1 : 1;
    sortObj[sortField] = sortDir;

    const [blogs, total] = await Promise.all([
      Blog.find(filter, search ? { score: { $meta: 'textScore' } } : {})
        .populate('author', 'name username avatar')
        .populate('category', 'name slug color icon')
        .select('-content')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    sendResponse(res, 200, {
      blogs,
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Public: Get single blog by slug ─────────────────────────────────────────
exports.getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'name username avatar bio')
      .populate('category', 'name slug color icon')
      .populate('commentCount');

    if (!blog) return next(createError(404, 'Blog not found.'));

    // Increment views
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

    // Check if current user liked it
    const isLiked = req.user ? blog.likes.includes(req.user._id) : false;
    const isSaved = req.user
      ? (await User.findById(req.user._id).select('savedBlogs')).savedBlogs.includes(blog._id)
      : false;

    sendResponse(res, 200, { blog: { ...blog.toObject(), isLiked, isSaved } });
  } catch (error) {
    next(error);
  }
};

// ─── Public: Get featured blogs ───────────────────────────────────────────────
exports.getFeaturedBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ status: 'published', isFeatured: true })
      .populate('author', 'name username avatar')
      .populate('category', 'name slug color icon')
      .select('-content')
      .sort('-createdAt')
      .limit(6)
      .lean();

    sendResponse(res, 200, { blogs });
  } catch (error) {
    next(error);
  }
};

// ─── Private: Create blog ─────────────────────────────────────────────────────
exports.createBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, coverImage, category, tags, status, meta } = req.body;

    const blog = await Blog.create({
      title, excerpt, content, coverImage, category,
      tags: tags || [],
      status: status || 'draft',
      meta: meta || {},
      author: req.user._id,
    });

    await blog.populate(['author', 'category']);
    sendResponse(res, 201, { blog }, 'Blog created successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Private: Update blog ─────────────────────────────────────────────────────
exports.updateBlog = async (req, res, next) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) return next(createError(404, 'Blog not found.'));

    // Only author or admin can update
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(createError(403, 'Not authorized to update this blog.'));
    }

    const allowedFields = ['title', 'excerpt', 'content', 'coverImage', 'category', 'tags', 'status', 'meta', 'isFeatured'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) blog[field] = req.body[field];
    });

    await blog.save();
    await blog.populate(['author', 'category']);

    sendResponse(res, 200, { blog }, 'Blog updated successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Private: Delete blog ─────────────────────────────────────────────────────
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(createError(404, 'Blog not found.'));

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(createError(403, 'Not authorized to delete this blog.'));
    }

    await Promise.all([
      Blog.findByIdAndDelete(req.params.id),
      Comment.deleteMany({ blog: req.params.id }),
    ]);

    sendResponse(res, 200, {}, 'Blog deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Private: Toggle like ─────────────────────────────────────────────────────
exports.toggleLike = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(createError(404, 'Blog not found.'));

    const userId = req.user._id;
    const liked = blog.likes.includes(userId);

    if (liked) {
      blog.likes.pull(userId);
    } else {
      blog.likes.push(userId);
    }
    await blog.save();

    sendResponse(res, 200, { liked: !liked, likeCount: blog.likes.length });
  } catch (error) {
    next(error);
  }
};

// ─── Private: Toggle save ─────────────────────────────────────────────────────
exports.toggleSave = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(createError(404, 'Blog not found.'));

    const user = await User.findById(req.user._id);
    const saved = user.savedBlogs.includes(req.params.id);

    if (saved) {
      user.savedBlogs.pull(req.params.id);
    } else {
      user.savedBlogs.push(req.params.id);
    }
    await user.save({ validateBeforeSave: false });

    sendResponse(res, 200, { saved: !saved });
  } catch (error) {
    next(error);
  }
};

// ─── Private: Get user's own blogs ───────────────────────────────────────────
exports.getMyBlogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;

    const filter = { author: req.user._id };
    if (status) filter.status = status;

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('category', 'name slug color')
        .select('-content')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    sendResponse(res, 200, { blogs, pagination: getPaginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

// ─── Private: Get saved blogs ─────────────────────────────────────────────────
exports.getSavedBlogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const user = await User.findById(req.user._id).select('savedBlogs');
    const total = user.savedBlogs.length;

    const blogs = await Blog.find({ _id: { $in: user.savedBlogs }, status: 'published' })
      .populate('author', 'name username avatar')
      .populate('category', 'name slug color')
      .select('-content')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean();

    sendResponse(res, 200, { blogs, pagination: getPaginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};
