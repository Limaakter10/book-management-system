const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// GET all messages
router.get("/", async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

// ✅ RESOLVE MESSAGE (🔥 THIS FIXES YOUR ISSUE)
router.put("/:id/resolve", async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isResolved: true },
      { new: true }
    );

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: "Error updating" });
  }
});

module.exports = router;