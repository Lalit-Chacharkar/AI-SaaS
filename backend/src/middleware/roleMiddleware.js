// ─────────────────────────────────────────────
// middleware/roleMiddleware.js
// Job: Check if the logged-in user has the required role
// Only runs AFTER authMiddleware (so req.user already exists)
// ─────────────────────────────────────────────

// This is a "middleware factory" — a function that RETURNS a middleware
// Why? Because we need to pass in WHICH roles are allowed
// We can't hardcode it — different routes need different roles

// Usage example:
//   restrictTo('admin')           → only admins allowed
//   restrictTo('admin', 'pro')    → admins and pro users allowed

const restrictTo = (...allowedRoles) => {
  // ...allowedRoles = "rest parameters" — collects all arguments into an array
  // restrictTo('admin', 'pro') → allowedRoles = ['admin', 'pro']

  // Return the actual middleware function
  return (req, res, next) => {

    // At this point, authMiddleware already ran and set req.user
    // So req.user.role = the role from the JWT token

    // .includes() checks if the user's role is in the allowed list
    if (!allowedRoles.includes(req.user.role)) {
      // 403 = Forbidden (you're authenticated but NOT authorized for this)
      // 401 = not logged in
      // 403 = logged in but not allowed — important difference!
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    // Role is allowed → proceed
    next();
  };
};

module.exports = { restrictTo };
