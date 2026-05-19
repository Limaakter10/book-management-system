const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages,
  resolveMessage // 🔥 ADD THIS
} = require("../controllers/messageController");

// ✅ POST
router.post("/", sendMessage);

// ✅ GET
router.get("/", getMessages);

// 🔥 ADD THIS LINE (MOST IMPORTANT)
router.put("/:id/resolve", resolveMessage);

module.exports = router;