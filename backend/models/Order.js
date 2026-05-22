const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  // ===============================
  // 👤 USER INFO
  // ===============================
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // ===============================
  // 📚 BOOKS (IMPROVED STRUCTURE)
  // ===============================
  books: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book"
      },
      title: String,
      price: Number
    }
  ],

  // ===============================
  // 💰 PAYMENT INFO
  // ===============================
  amount: {
    type: Number,
    required: true,
    min: 0
  },

  method: {
    type: String,
    enum: ["bkash", "nagad", "ssl"],
    default: "ssl"
  },

  // ===============================
  // 🔑 TRANSACTION INFO
  // ===============================
  tranId: {
    type: String,
    required: true,
    unique: true
  },

  valId: {
    type: String,
    default: null
  },

  // ===============================
  // 📊 STATUS
  // ===============================
 status: {
  type: String,
  enum: ["paid", "failed"], // ✅ only 2
  default: "failed"         // ✅ default failed
},

  // ===============================
  // 👨‍💼 ADMIN CONTROL
  // ===============================
  approved: {
    type: Boolean,
    default: false
  },

  // ===============================
  // 🔔 NOTIFICATION
  // ===============================
  notified: {
    type: Boolean,
    default: false
  },

  // ===============================
  // 🎟️ EXTRA (NEW FEATURES)
  // ===============================
  coupon: {
    type: String,
    default: null
  },

  discountAmount: {
    type: Number,
    default: 0
  },

  tax: {
    type: Number,
    default: 0
  },

  // ===============================
  // 🧾 GATEWAY RAW DATA
  // ===============================
  gatewayData: {
    type: Object,
    default: {}
  },

  // ===============================
  // ⏰ TIME
  // ===============================
  paidAt: {
    type: Date,
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);