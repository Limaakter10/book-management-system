const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ===============================
    // 👤 BASIC INFO
    // ===============================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ===============================
    // 📚 USER LIBRARY (PURCHASED BOOKS)
    // ===============================
    library: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],

    // ===============================
    // 🛒 CART (OPTIONAL - SERVER SIDE)
    // ===============================
    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],

    // ===============================
    // 🔐 ROLE SYSTEM
    // ===============================
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ===============================
    // 🚫 ACCOUNT CONTROL (ADMIN)
    // ===============================
    isBlocked: {
      type: Boolean,
      default: false,
    },

    // ===============================
    // 📱 OPTIONAL (FUTURE USE)
    // ===============================
    phone: {
      type: String,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);