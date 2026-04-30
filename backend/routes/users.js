const express = require('express');
const { getUserProfile, updateProfile, getSavedBlogs, toggleFollow } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/saved', protect, getSavedBlogs);
router.get('/:username', getUserProfile);
router.put('/profile', protect, updateProfile);
router.post('/:id/follow', protect, toggleFollow);

module.exports = router;
