// ─────────────────────────────────────────────
// models/User.js
// Job: Define the shape and rules of a User document in MongoDB
// A "Model" = a class that represents a MongoDB collection
// A "Schema" = the blueprint — what fields exist and their rules
// ─────────────────────────────────────────────

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Define the Schema ──
// Think of this as designing a form:
// "What fields does a User have? What type? Required? Default value?"
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,       // must be text
      required: [true, 'Name is required'],  // [rule, error message if broken]
      trim: true          // removes whitespace from both ends: "  Ali  " → "Ali"
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,       // no two users can have same email (DB enforces this)
      lowercase: true,    // always store as lowercase: "Ali@Gmail.COM" → "ali@gmail.com"
      trim: true
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },

    role: {
      type: String,
      enum: ['user', 'pro', 'admin'],  // only these 3 values allowed
      default: 'user'                  // if not provided, defaults to 'user'
    }
  },
  {
    // Second argument to Schema = options
    timestamps: true
    // timestamps: true automatically adds TWO fields to every document:
    //   createdAt → when the user registered
    //   updatedAt → when the user was last modified
    // You don't write them manually — mongoose handles it
  }
);

// ── Pre-save Hook ──
// In modern Mongoose (v7+), async pre-save hooks don't need 'next'
// Just use async/await and return — mongoose handles the rest
userSchema.pre('save', async function () {
  // 'this' = the user document being saved
  if (!this.isModified('password')) return;

  // Hash the password automatically before saving
  this.password = await bcrypt.hash(this.password, 10);
});

// ── Instance Method ──
// A custom method we add to every User document
// Called on a specific user: user.comparePassword(typed)
userSchema.methods.comparePassword = async function (typedPassword) {
  // 'this.password' = the stored hash on THIS user document
  return await bcrypt.compare(typedPassword, this.password);
};

// ── Create and Export the Model ──
// mongoose.model('User', userSchema)
//   'User' = model name → MongoDB creates collection named 'users' (lowercase plural)
//   userSchema = the blueprint we defined above
const User = mongoose.model('User', userSchema);

module.exports = User;
