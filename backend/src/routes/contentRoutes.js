// ─────────────────────────────────────────────
// routes/contentRoutes.js
// Job: Protected content generation routes
// These routes require authentication + correct role
// ─────────────────────────────────────────────

const express = require('express');
const router = express.Router();

// Import both middleware
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { generateContent } = require('../controllers/contentController');

// ── Route 1: Any logged-in user can access ──
// protect = must have valid JWT token
// No role restriction = all authenticated users allowed
router.get('/dashboard', protect, (req, res) => {
  // req.user was set by authMiddleware — we can use it here!
  res.json({
    message: `Welcome to your dashboard, ${req.user.userId}!`,
    role: req.user.role,
    access: 'authenticated users only'
  });
});

// ── Route 2: Only 'pro' or 'admin' can generate content ──
router.post('/generate', protect, restrictTo('pro', 'admin'), generateContent);

// ── Route 3: Only 'admin' can see all users ──
router.get('/admin/users', protect, restrictTo('admin'), (req, res) => {
  res.json({
    message: 'Admin only area',
    access: 'admin role required'
  });
});

module.exports = router;
