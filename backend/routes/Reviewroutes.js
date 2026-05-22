// reviewRoutes.js — Review API Routes
// ✅ protectReview middleware use করা হচ্ছে
// যেটা "demo-token-USERID" format handle করতে পারে

const express = require("express");
const router = express.Router();

const {
  addOrUpdateReview,
  getBookReviews,
  getMyReview,
  deleteReview,
  getBulkRatings,
} = require("../controllers/reviewController");

// ✅ নতুন middleware — demo-token format support করে
const { protectReview } = require("../middleware/reviewAuth");

// ── Public Routes (token লাগবে না) ──────────────────────────

// Multiple books এর rating — bulk (এটা /:bookId এর আগে থাকতে হবে!)
router.post("/bulk-ratings", getBulkRatings);

// একটি book এর সব review
router.get("/:bookId", getBookReviews);

// ── Protected Routes (token লাগবে) ──────────────────────────

// নিজের review দেখা
router.get("/:bookId/my-review", protectReview, getMyReview);

// Review add বা update
router.post("/:bookId", protectReview, addOrUpdateReview);

// Review delete
router.delete("/:reviewId", protectReview, deleteReview);

module.exports = router;