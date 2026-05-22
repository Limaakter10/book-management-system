// authMiddleware.js — JWT token verify করা
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // Header থেকে token নেওয়া
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>" থেকে token অংশ

    // Token verify করা
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Database থেকে user আনা (password ছাড়া)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next(); // পরের middleware/route এ যাবে
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = { protect };