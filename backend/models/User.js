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
    // 🛒 CART
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
    // 🚫 ACCOUNT CONTROL
    // ===============================
    isBlocked: {
      type: Boolean,
      default: false,
    },

    // ===============================
    // 📱 PROFILE INFO (NEW)
    // ===============================
    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
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