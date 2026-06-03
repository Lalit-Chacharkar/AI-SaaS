// ─────────────────────────────────────────────
// middleware/authMiddleware.js
// Job: Verify the JWT token on every protected request
// Middleware = sits BETWEEN the request and the controller
// ─────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

// A middleware function always has 3 parameters:
//   req  = incoming request
//   res  = outgoing response
//   next = function to call when middleware is DONE
//          calling next() = "I'm finished, pass to the next handler"
//          NOT calling next() = request stops here

const protect = (req, res, next) => {

  // ── Step 1: Get the token from request headers ──
  // Standard convention: token is sent in the "Authorization" header
  // Format: "Bearer eyJhbGci..."
  //          ↑       ↑
  //         word    the actual token
  // This format is called "Bearer Token" — industry standard

  const authHeader = req.headers['authorization'];
  //                     ↑ headers are lowercase in Node.js

  // Check if header exists AND starts with "Bearer "
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]  // split "Bearer TOKEN" by space, take index [1]
    : null;

  // ── Step 2: If no token → reject immediately ──
  if (!token) {
    return res.status(401).json({
      message: 'Access denied. No token provided.'
    });
  }

  // ── Step 3: Verify the token is real and not expired ──
  // jwt.verify() does TWO things:
  //   1. Checks the signature (was this signed by OUR secret key?)
  //   2. Checks expiry (is it still valid?)
  // If either fails → throws an error → caught in catch block

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded = the PAYLOAD we put inside the token during login
    // { userId: 1, role: 'user', iat: ..., exp: ... }

    // ── Step 4: Attach user info to the request object ──
    // req.user is NOT built-in — we're ADDING it ourselves
    // Now every controller after this middleware can access req.user
    req.user = decoded;

    // ── Step 5: Pass control to the next handler ──
    next();
    // Without this line, the request would hang forever — never reaches controller

  } catch (error) {
    // jwt.verify() throws errors for:
    //   JsonWebTokenError  → token is fake/tampered
    //   TokenExpiredError  → token is valid but expired
    return res.status(401).json({
      message: 'Invalid or expired token.'
    });
  }
};

module.exports = { protect };
