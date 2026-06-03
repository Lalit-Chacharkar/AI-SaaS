// ─────────────────────────────────────────────
// controllers/stripeController.js
// Job: Handle Stripe checkout and webhook
// ─────────────────────────────────────────────

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// stripe() is a function that takes your secret key and returns a Stripe client
// All Stripe API calls go through this client

const User = require('../models/User');

// ─────────────────────────────────────────────
// CREATE CHECKOUT SESSION
// Route: POST /api/stripe/create-checkout-session
// What it does: creates a Stripe hosted payment page URL
// Returns the URL → frontend redirects user there
// ─────────────────────────────────────────────
const createCheckoutSession = async (req, res) => {
  try {
    // req.user comes from authMiddleware (JWT decoded)
    const { userId, role } = req.user;

    // Don't charge someone already on pro
    if (role === 'pro' || role === 'admin') {
      return res.status(400).json({ message: 'You are already on Pro plan' });
    }

    // Find the user in DB to get their email
    // Stripe needs email to send receipts
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ── Create Stripe Checkout Session ──
    // This creates a temporary payment page hosted by Stripe
    const session = await stripe.checkout.sessions.create({

      payment_method_types: ['card'],
      // Which payment methods to accept
      // 'card' = credit/debit cards

      mode: 'subscription',
      // 'subscription' = recurring monthly charge
      // 'payment' = one-time charge

      customer_email: user.email,
      // Pre-fills the email on Stripe's payment page

      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          // The price object we created in Stripe dashboard
          quantity: 1
        }
      ],

      // ── Success/Cancel URLs ──
      // Where Stripe redirects AFTER payment
      // {CHECKOUT_SESSION_ID} = Stripe replaces this with real session ID
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?cancelled=true`,

      // ── Metadata ──
      // Extra data we attach to this session
      // Available in the webhook later — how we know WHICH user to upgrade
      metadata: {
        userId: userId.toString()
        // MongoDB ObjectId → convert to string for Stripe metadata
      }
    });

    // Send the checkout URL back to frontend
    // Frontend will redirect user to this URL
    res.status(200).json({
      url: session.url
      // looks like: https://checkout.stripe.com/pay/cs_test_...
    });

  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

// ─────────────────────────────────────────────
// WEBHOOK HANDLER
// Route: POST /api/stripe/webhook
// Called BY STRIPE (not by our frontend) when payment succeeds
// This is where we actually upgrade the user's role
// ─────────────────────────────────────────────
const handleWebhook = async (req, res) => {
  // ── Verify the webhook is actually from Stripe ──
  // Anyone could POST to our webhook URL — we must verify it's really Stripe
  // Stripe signs every webhook with STRIPE_WEBHOOK_SECRET
  // stripe.webhooks.constructEvent() verifies that signature

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,                              // raw request body (must be raw, not parsed JSON)
      sig,                                   // Stripe's signature header
      process.env.STRIPE_WEBHOOK_SECRET      // our webhook secret to verify against
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).json({ message: 'Webhook verification failed' });
  }

  // ── Handle different event types ──
  // Stripe sends many event types — we only care about successful payments
  switch (event.type) {

    case 'checkout.session.completed':
      // Payment was successful!
      const session = event.data.object;
      // session = the checkout session object

      // Get the userId we stored in metadata
      const userId = session.metadata.userId;

      // Upgrade the user's role to 'pro' in MongoDB
      await User.findByIdAndUpdate(userId, { role: 'pro' });
      // findByIdAndUpdate(id, changes) = find user + update in one step

      console.log(`✅ User ${userId} upgraded to Pro`);
      break;

    case 'customer.subscription.deleted':
      // Subscription was cancelled
      // In a full app: downgrade user back to 'user' role
      console.log('Subscription cancelled:', event.data.object.id);
      break;

    default:
      // All other events — ignore
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Must respond with 200 quickly — Stripe retries if no response
  res.status(200).json({ received: true });
};

module.exports = { createCheckoutSession, handleWebhook };
