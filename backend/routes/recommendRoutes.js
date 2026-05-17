const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Book = require("../models/Book");

// ================= SMART + GUIDE =================
router.get("/advanced/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    const interests = user.interests || [];
    const completedIds = user.progress.map(p => p.bookId);

    // 🔥 LEVEL BASED LOGIC
    const beginner = await Book.find({
      skill: { $in: interests },
      level: "beginner"
    });

    const intermediate = await Book.find({
      skill: { $in: interests },
      level: "intermediate"
    });

    const advanced = await Book.find({
      skill: { $in: interests },
      level: "advanced"
    });

    // 🔥 PERSONALIZED (EXCLUDE COMPLETED)
    const recommended = await Book.find({
      skill: { $in: interests },
      _id: { $nin: completedIds }
    }).limit(6);

    res.json({
      roadmap: {
        beginner,
        intermediate,
        advanced
      },
      recommended
    });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;