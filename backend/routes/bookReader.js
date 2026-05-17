const express = require("express");
const router = express.Router();
const path = require("path");

// 📚 SECURE BOOK READ ROUTE
router.get("/read/:filename", (req, res) => {
  try {
    const filePath = path.join(__dirname, "../uploads", req.params.filename);

    // 🔥 IMPORTANT: inline (not download)
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    res.sendFile(filePath);

  } catch (err) {
    res.status(500).send("Error loading book");
  }
});

module.exports = router;