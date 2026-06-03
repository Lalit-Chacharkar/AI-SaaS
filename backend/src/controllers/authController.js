// ─────────────────────────────────────────────
// controllers/authController.js
// Job: Handle register and login logic
// A "controller" = a function that handles a specific route's logic
// ─────────────────────────────────────────────

// Import jsonwebtoken — used to create and verify tokens
const jwt = require('jsonwebtoken');

// Import our JWT config (secret key + expiry time)
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');

// Import the User MODEL — our gateway to the MongoDB users collection
// Instead of users[] array, we now query the real database
const User = require('../models/User');

// ─────────────────────────────────────────────
// REGISTER CONTROLLER
// This function runs when POST /api/auth/register is called
// ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Validation ──
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // ── Check duplicate email ──
    // User.findOne() = search MongoDB for ONE document matching the query
    // { email } = shorthand for { email: email }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // ── Create and save user ──
    // User.create() = new User() + user.save() in one step
    // Password hashing happens automatically via pre-save hook in User.js
    const newUser = await User.create({ name, email, password });
    // newUser now has: id, name, email, password(hashed), role, createdAt, updatedAt

    // ── Generate JWT token ──
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      // _id = MongoDB's auto-generated unique ID (ObjectId)
      // looks like: "6657a1b2c3d4e5f6a7b8c9d0"
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ─────────────────────────────────────────────
// LOGIN CONTROLLER
// This function runs when POST /api/auth/login is called
// ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // ── Find user by email ──
    // User.findOne({ email }) = "search users collection for document where email matches"
    // Returns null if not found (not undefined like array.find)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ── Compare password using our instance method ──
    // user.comparePassword() = the method we added in User.js
    // Much cleaner than writing bcrypt.compare() here
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ── Generate JWT token ──
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Export both functions so routes can use them
module.exports = { register, login };
