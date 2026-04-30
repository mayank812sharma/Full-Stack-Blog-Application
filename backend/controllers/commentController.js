const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const { createError } = require('../utils/apiError');
const { sendResponse, parsePagination, getPaginationMeta } = require('../utils/apiResponse');

// @desc Get comments for a blog
// @route GET /api/comments/:blogId
exports.getComments = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { page, limit, skip } = parsePagination(req.query);

    const blog = await Blog.findById(blogId);
    if (!blog) return next(createError(404, 'Blog not found.'));

    const filter = { blog: blogId, parent: null, isDeleted: false };

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate('author', 'name username avatar')
        .populate({
          path: 'replies',
          match: { isDeleted: false },
          populate: { path: 'author', select: 'name username avatar' },
        })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Comment.countDocuments(filter),
    ]);

    sendResponse(res, 200, { comments, pagination: getPaginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

// @desc Create comment
// @route POST /api/comments/:blogId
exports.createComment = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { content, parent } = req.body;

    const blog = await Blog.findById(blogId);
    if (!blog) return next(createError(404, 'Blog not found.'));

    // Validate parent comment exists if provided
    if (parent) {
      const parentComment = await Comment.findById(parent);
      if (!parentComment) return next(createError(404, 'Parent comment not found.'));
    }

    const comment = await Comment.create({
      content,
      author: req.user._id,
      blog: blogId,
      parent: parent || null,
    });

    await comment.populate('author', 'name username avatar');
    sendResponse(res, 201, { comment }, 'Comment added successfully');
  } catch (error) {
    next(error);
  }
};

// @desc Update comment
// @route PUT /api/comments/:id
exports.updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return next(createError(404, 'Comment not found.'));
    if (comment.author.toString() !== req.user._id.toString()) {
      return next(createError(403, 'Not authorized.'));
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    await comment.save();

    sendResponse(res, 200, { comment }, 'Comment updated');
  } catch (error) {
    next(error);
  }
};

// @desc Delete comment
// @route DELETE /api/comments/:id
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return next(createError(404, 'Comment not found.'));

    const isOwner = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return next(createError(403, 'Not authorized.'));

    // Soft delete
    comment.isDeleted = true;
    comment.content = '[This comment has been deleted]';
    await comment.save();

    sendResponse(res, 200, {}, 'Comment deleted');
  } catch (error) {
    next(error);
  }
};

// @desc Toggle like on comment
// @route POST /api/comments/:id/like
exports.toggleLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return next(createError(404, 'Comment not found.'));

    const userId = req.user._id;
    const liked = comment.likes.includes(userId);
    if (liked) comment.likes.pull(userId);
    else comment.likes.push(userId);
    await comment.save();

    sendResponse(res, 200, { liked: !liked, likeCount: comment.likes.length });
  } catch (error) {
    next(error);
  }
};
