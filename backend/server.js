// ─────────────────────────────────────────────
// server.js — Entry point of our backend
// This file: creates the server, loads config,
// connects routes, starts listening for requests
// ─────────────────────────────────────────────

// 0. Load .env file FIRST — before anything else
//    This puts all .env variables into process.env
//    Must be the very first line so all other files can use process.env
require('dotenv').config();

// 1. Import express (pull it from node_modules)
const express = require('express');
const cors = require('cors');

// Import database connection function
const connectDB = require('./src/config/db');

// Connect to MongoDB (runs immediately)
connectDB();

// 2. Create an "app" — this is your web server instance
//    Think of it as: "I now have a server, it just isn't on yet"
const app = express();

// CORS = Cross-Origin Resource Sharing
// Browser blocks requests between different ports by default (security rule)
// Our frontend (port 5173) talking to backend (port 5000) = blocked without this
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));

// 3. Middleware — app.use() means "run this for EVERY request"
//    express.json() lets our server READ json data sent by clients
//    Without this: req.body would be undefined when someone sends JSON

// ⚠️ IMPORTANT: Stripe webhook needs RAW body (not parsed JSON)
// express.raw() must be registered BEFORE express.json()
// Only for the webhook route — all other routes use JSON
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// For all other routes — parse as JSON as normal
app.use(express.json());

// 4. Import and mount routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Content routes (protected — require JWT token)
const contentRoutes = require('./src/routes/contentRoutes');
app.use('/api/content', contentRoutes);

// Stripe routes (checkout + webhook)
const stripeRoutes = require('./src/routes/stripeRoutes');
app.use('/api/stripe', stripeRoutes);

// 5. A test route — our first ever API endpoint!
//    app.get() = respond to GET requests
//    '/api/health' = the URL path
//    (req, res) => {} = what to do when that URL is hit
//      req = the incoming REQUEST (what the client sent)
//      res = the RESPONSE (what we send back)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AI-SaaS backend is running!',
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  });
});

// 5. Define which PORT to listen on
//    process.env.PORT = checks for environment variable first (for production)
//    || 5000 = fallback to 5000 if no env variable set (for development)
const PORT = process.env.PORT || 5000;

// 6. START the server — tell it to listen for incoming requests
//    This is the actual "ON" button
app.listen(PORT, () => {
  // This callback runs ONCE when server successfully starts
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
