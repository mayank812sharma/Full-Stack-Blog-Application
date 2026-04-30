const express = require('express');
const { body } = require('express-validator');
const {
  getBlogs, getBlogBySlug, getFeaturedBlogs, createBlog, updateBlog,
  deleteBlog, toggleLike, toggleSave, getMyBlogs, getSavedBlogs,
} = require('../controllers/blogController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const blogValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 5, max: 150 }),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required').isLength({ max: 300 }),
  body('content').trim().notEmpty().withMessage('Content is required').isLength({ min: 50 }),
  body('category').notEmpty().withMessage('Category is required').isMongoId(),
  body('status').optional().isIn(['draft', 'published']),
  validate,
];

router.get('/', getBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/me', protect, getMyBlogs);
router.get('/saved', protect, getSavedBlogs);
router.get('/:slug', optionalAuth, getBlogBySlug);

router.post('/', protect, blogValidation, createBlog);
router.put('/:id', protect, blogValidation, updateBlog);
router.delete('/:id', protect, deleteBlog);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/save', protect, toggleSave);

module.exports = router;
