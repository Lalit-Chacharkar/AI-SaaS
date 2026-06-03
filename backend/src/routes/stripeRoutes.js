// ─────────────────────────────────────────────
// routes/stripeRoutes.js
// ─────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createCheckoutSession, handleWebhook } = require('../controllers/stripeController');

// Create checkout session — must be logged in
router.post('/create-checkout-session', protect, createCheckoutSession);

// ── Webhook — special case ──
// NO auth middleware here — Stripe calls this, not our frontend
// Stripe can't send a JWT token!
// Security is handled by stripe.webhooks.constructEvent() instead
router.post('/webhook', handleWebhook);

module.exports = router;
