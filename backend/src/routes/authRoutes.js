// ─────────────────────────────────────────────
// routes/authRoutes.js
// Job: ONLY define which URL + method → which controller function
// No logic here — just mapping
// ─────────────────────────────────────────────

const express = require('express');

// express.Router() = a mini version of app
// Instead of app.get(), we do router.get()
// Lets us group related routes together, then attach to app in server.js
const router = express.Router();

// Import the controller functions we want to attach to routes
const { register, login } = require('../controllers/authController');
//      ↑ destructuring the two exported functions

// ── Define Routes ──
// router.post() = respond to POST requests (sending data to server)
// '/register' = the path (will become /api/auth/register in server.js)
// register = the controller function to run when this route is hit
router.post('/register', register);
router.post('/login', login);

// Export the router so server.js can use it
module.exports = router;
