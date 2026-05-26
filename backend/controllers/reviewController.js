// ============================================================
// 📄 reviewController.js — Review Logic
// Routes:
//   POST   /api/reviews/:bookId          — add or update
//   GET    /api/reviews/:bookId          — get all reviews
//   GET    /api/reviews/:bookId/my-review — get my review
//   DELETE /api/reviews/:reviewId        — delete
//   POST   /api/reviews/bulk-ratings     — bulk ratings
// ============================================================

const Review   = require("../models/Review");
const Book     = require("../models/Book");
const mongoose = require("mongoose");

// ── Helper: recalculate book rating after any change ─────────
// Called after add, update, or delete
const updateBookRating = async (bookId) => {
  const reviews = await Review.find({ book: bookId });

  if (reviews.length === 0) {
    // No reviews left — reset book rating
    await Book.findByIdAndUpdate(bookId, { rating: 0, numReviews: 0 });
    return;
  }

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // Update book with new average rating + review count
  // This is what HomeSection Bestsellers tab uses
  await Book.findByIdAndUpdate(bookId, {
    rating:     Math.round(avg * 10) / 10, // e.g. 4.3
    numReviews: reviews.length,
  });
};

// ── 1. Add or Update Review ───────────────────────────────────
// POST /api/reviews/:bookId
// Body: { rating, comment }
const addOrUpdateReview = async (req, res) => {
  try {
    const { bookId }          = req.params;
    const { rating, comment } = req.body;
    const userId              = req.user._id;

    // Check book exists
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Check if user already reviewed this book
    let review = await Review.findOne({ book: bookId, user: userId });

    if (review) {
      // Update existing review
      review.rating  = rating;
      review.comment = comment;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({ book: bookId, user: userId, rating, comment });
    }

    // ✅ Recalculate book's rating — HomeSection will show updated data
    await updateBookRating(bookId);

    res.status(review ? 200 : 201).json({
      success: true,
      message: review ? "Review updated" : "Review submitted",
      review,
    });
  } catch (err) {
    console.error("addOrUpdateReview error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "You already reviewed this book" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── 2. Get all reviews for a book ────────────────────────────
// GET /api/reviews/:bookId
const getBookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate("user", "name email") // get user name
      .sort({ createdAt: -1 });       // newest first

    const total = reviews.length;
    const avg   = total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;

    res.json({
      success:       true,
      reviews,
      totalReviews:  total,
      averageRating: parseFloat(avg.toFixed(1)),
    });
  } catch (err) {
    console.error("getBookReviews error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── 3. Get current user's review for a book ──────────────────
// GET /api/reviews/:bookId/my-review
const getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      book: req.params.bookId,
      user: req.user._id,
    });
    res.json({ success: true, review: review || null });
  } catch (err) {
    console.error("getMyReview error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── 4. Delete a review ────────────────────────────────────────
// DELETE /api/reviews/:reviewId
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Only owner can delete
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const bookId = review.book;
    await review.deleteOne();

    // ✅ Recalculate book rating after delete
    await updateBookRating(bookId);

    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    console.error("deleteReview error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── 5. Bulk ratings for multiple books ───────────────────────
// POST /api/reviews/bulk-ratings
// Body: { bookIds: ["id1", "id2", ...] }
const getBulkRatings = async (req, res) => {
  try {
    const { bookIds } = req.body;
    if (!bookIds || bookIds.length === 0) {
      return res.status(400).json({ message: "Provide bookIds array" });
    }

    // Aggregate: group by book, calculate avg rating
    const ratings = await Review.aggregate([
      {
        $match: {
          book: { $in: bookIds.map(id => new mongoose.Types.ObjectId(id)) },
        },
      },
      {
        $group: {
          _id:           "$book",
          averageRating: { $avg: "$rating" },
          totalReviews:  { $sum: 1 },
        },
      },
    ]);

    // Convert to { bookId: { averageRating, totalReviews } } map
    const ratingsMap = {};
    ratings.forEach(r => {
      ratingsMap[r._id.toString()] = {
        averageRating: parseFloat(r.averageRating.toFixed(1)),
        totalReviews:  r.totalReviews,
      };
    });

    res.json({ success: true, ratings: ratingsMap });
  } catch (err) {
    console.error("getBulkRatings error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  addOrUpdateReview,
  getBookReviews,
  getMyReview,
  deleteReview,
  getBulkRatings,
};