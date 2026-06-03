// ─────────────────────────────────────────────
// config/jwt.js — JWT Secret Configuration
// ─────────────────────────────────────────────

// JWT_SECRET is the private key used to SIGN tokens
// Think of it as: the wax seal stamp that only YOU own
// If someone fakes a token without this secret → verification fails ❌
// process.env.JWT_SECRET = loaded from .env file (we'll create this)
// || fallback = only for development, NEVER use a simple string in production

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// JWT_EXPIRES_IN = how long a token is valid
// '7d' = 7 days. After that, user must login again.
// Other options: '1h' (1 hour), '30d' (30 days), '1y' (1 year)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// module.exports = how we SHARE this with other files in CommonJS
// Any file that does require('./config/jwt') gets this object
module.exports = { JWT_SECRET, JWT_EXPIRES_IN };
