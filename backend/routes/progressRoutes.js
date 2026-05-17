const express = require("express");
const router = express.Router();
const User = require("../models/User");

// COMPLETE BOOK
router.post("/complete", async (req, res) => {
  const { userId, bookId, skill, level } = req.body;

  const user = await User.findById(userId);

  user.progress.push({
    bookId,
    skill,
    level,
    completed: true
  });

  await user.save();

  res.json({ success: true });
});

// GET PROGRESS
router.get("/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.json({ progress: user.progress });
});

module.exports = router;