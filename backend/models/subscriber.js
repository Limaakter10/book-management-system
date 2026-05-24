// ============================================================
// 📄 backend/models/Subscriber.js
// Newsletter subscriber এর email store করে
// ============================================================

const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,      // duplicate email আসবে না
    lowercase: true,
    trim: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model("Subscriber", subscriberSchema);