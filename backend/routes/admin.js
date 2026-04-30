const express = require('express');
const {
  getDashboardStats, getUsers, toggleUserActive, updateUserRole,
  getBlogs, toggleFeature, deleteBlog,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);

router.get('/users', getUsers);
router.patch('/users/:id/toggle-active', toggleUserActive);
router.patch('/users/:id/role', updateUserRole);

router.get('/blogs', getBlogs);
router.patch('/blogs/:id/feature', toggleFeature);
router.delete('/blogs/:id', deleteBlog);

module.exports = router;
