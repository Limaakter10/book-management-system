// ================= IMPORT =================
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/User");


// =======================================================
// ✅ 1. ADD SINGLE BOOK TO LIBRARY
// =======================================================
router.post("/add-to-library", async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    // ❌ check missing data
    if (!userId || !bookId) {
      return res.status(400).json({
        success: false,
        message: "userId and bookId required"
      });
    }

    // ❌ check invalid Mongo ID
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    // 🔍 check user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 🔥 add book (no duplicate)
    await User.findByIdAndUpdate(userId, {
      $addToSet: { library: bookId }
    });

    res.json({
      success: true,
      message: "Book added to library"
    });

  } catch (err) {
    console.error("ADD LIBRARY ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Error adding to library"
    });
  }
});


// =======================================================
// ✅ 2. ADD MULTIPLE BOOKS (AFTER PAYMENT)
// =======================================================
router.post("/add-to-library-bulk", async (req, res) => {
  try {
    const { userId, books } = req.body;

    // ❌ validation
    if (!userId || !books || books.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userId and books required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId"
      });
    }

    // 🔍 check user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 🔥 filter valid book IDs
    const validBooks = books.filter(id =>
      mongoose.Types.ObjectId.isValid(id)
    );

    // 🔥 add multiple books safely
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        library: { $each: validBooks }
      }
    });

    res.json({
      success: true,
      message: "Books added to library"
    });

  } catch (err) {
    console.error("BULK LIBRARY ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Error saving library"
    });
  }
});


// =======================================================
// ✅ 3. GET USER LIBRARY
// =======================================================
router.get("/library/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // ❌ invalid ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId"
      });
    }

    // 🔍 get user + populate books
    const user = await User.findById(userId).populate("library");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // ✅ return books
    res.json(user.library);

  } catch (err) {
    console.error("LIBRARY ERROR:", err);
    res.status(500).json({
      message: "Error fetching library"
    });
  }
});


// =======================================================
// 👑 4. ADMIN: GET ALL USERS
// =======================================================
router.get("/all", async (req, res) => {
  try {
    // ❌ never send password
    const users = await User.find().select("-password");

    res.json(users);

  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({
      message: "Error fetching users"
    });
  }
});


// =======================================================
// 👑 5. ADMIN: BLOCK / UNBLOCK USER
// =======================================================
router.post("/block/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 🔥 toggle block status
    user.isBlocked = !user.isBlocked;

    await user.save();

    res.json({
      success: true,
      message: user.isBlocked
        ? "User blocked 🚫"
        : "User unblocked ✅"
    });

  } catch (err) {
    console.error("BLOCK ERROR:", err);
    res.status(500).json({
      message: "Error updating user"
    });
  }
});


// =======================================================
// 👑 6. ADMIN: DELETE USER
// =======================================================
router.delete("/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted 🗑️"
    });

  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({
      message: "Error deleting user"
    });
  }
});


// ================= EXPORT =================
module.exports = router;