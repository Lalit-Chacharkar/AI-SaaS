// ─────────────────────────────────────────────
// config/db.js
// Job: Connect to MongoDB using mongoose
// Called ONCE when server starts
// ─────────────────────────────────────────────

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect() returns a Promise → we await it
    // process.env.MONGO_URI = loaded from .env file by dotenv
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // conn.connection.host = the Atlas cluster URL (confirms which DB we connected to)
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

  } catch (error) {
    // If connection fails → log the error and EXIT the process
    // No point running the server without a database
    // process.exit(1) = shut down with error code 1 (means "failed")
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
