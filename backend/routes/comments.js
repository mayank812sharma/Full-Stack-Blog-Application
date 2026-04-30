const express = require('express');
const { body } = require('express-validator');
const { getComments, createComment, updateComment, deleteComment, toggleLike } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/:blogId', getComments);
router.post('/:blogId', protect, [
  body('content').trim().notEmpty().withMessage('Comment content is required').isLength({ max: 1000 }),
  validate,
], createComment);
router.put('/:id', protect, [
  body('content').trim().notEmpty().withMessage('Content is required').isLength({ max: 1000 }),
  validate,
], updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, toggleLike);

module.exports = router;
