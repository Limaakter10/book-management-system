// reviewAuth.js — Review routes এর জন্য custom auth middleware
// তোমার project এ "demo-token-USERID" format এ token আছে
// তাই JWT verify না করে userId directly বের করা হচ্ছে

const User = require("../models/User");

const protectReview = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    let userId = null;

    // ── Case 1: "demo-token-USERID" format ─────────────────
    // তোমার project এ এই format এ token আছে
    if (token.startsWith("demo-token-")) {
      userId = token.replace("demo-token-", "");
    }
    // ── Case 2: Real JWT token ──────────────────────────────
    else {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // id বা _id যেটাই থাকুক
        userId = decoded.id || decoded._id || decoded.userId;
      } catch {
        return res.status(401).json({ message: "Token invalid or expired" });
      }
    }

    if (!userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    // Database থেকে user আনা
    const User_ = require("../models/User");
    const user = await User_.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // পরের middleware/route এ user পাবে
    next();

  } catch (error) {
    console.error("Review auth error:", error.message);
    return res.status(401).json({ message: "Authorization failed" });
  }
};

module.exports = { protectReview };