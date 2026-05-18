// ================= IMPORT =================
const express    = require("express");
const router     = express.Router();
const mongoose   = require("mongoose");
const bcrypt     = require("bcryptjs");
const User       = require("../models/User");

// =======================================================
// ✅ 1. ADD SINGLE BOOK TO LIBRARY
// POST /api/users/add-to-library
// =======================================================
router.post("/add-to-library", async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    if (!userId || !bookId)
      return res.status(400).json({ success: false, message: "userId and bookId required" });

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookId))
      return res.status(400).json({ success: false, message: "Invalid ID format" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await User.findByIdAndUpdate(userId, { $addToSet: { library: bookId } });

    res.json({ success: true, message: "Book added to library" });

  } catch (err) {
    console.error("ADD LIBRARY ERROR:", err);
    res.status(500).json({ success: false, message: "Error adding to library" });
  }
});

// =======================================================
// ✅ 2. ADD MULTIPLE BOOKS (AFTER PAYMENT)
// POST /api/users/add-to-library-bulk
// =======================================================
router.post("/add-to-library-bulk", async (req, res) => {
  try {
    const { userId, books } = req.body;

    if (!userId || !books || books.length === 0)
      return res.status(400).json({ success: false, message: "userId and books required" });

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ success: false, message: "Invalid userId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const validBooks = books.filter(id => mongoose.Types.ObjectId.isValid(id));

    await User.findByIdAndUpdate(userId, {
      $addToSet: { library: { $each: validBooks } }
    });

    res.json({ success: true, message: "Books added to library" });

  } catch (err) {
    console.error("BULK LIBRARY ERROR:", err);
    res.status(500).json({ success: false, message: "Error saving library" });
  }
});

// =======================================================
// ✅ 3. GET USER LIBRARY
// GET /api/users/library/:userId
// =======================================================
router.get("/library/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid userId" });

    const user = await User.findById(userId).populate("library");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.library);

  } catch (err) {
    console.error("LIBRARY ERROR:", err);
    res.status(500).json({ message: "Error fetching library" });
  }
});

// =======================================================
// ✅ 4. GET USER PROFILE
// GET /api/users/profile/:userId
// =======================================================
router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid userId" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);

  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// =======================================================
// ✅ 5. UPDATE USER PROFILE
// PUT /api/users/profile/:userId
// name, phone, address আপডেট করা যাবে
// =======================================================
router.put("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, address } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid userId" });

    // শুধু এই fields update হবে — password/role ছোঁয়া যাবে না
    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: { name, phone, address } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user: updated });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// =======================================================
// ✅ 6. CHANGE PASSWORD
// PUT /api/users/change-password/:userId
// =======================================================
router.put("/change-password/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid userId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    // hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });

  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Error changing password" });
  }
});

// =======================================================
// 👑 7. ADMIN: GET ALL USERS
// GET /api/users/all
// =======================================================
router.get("/all", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// =======================================================
// 👑 8. ADMIN: BLOCK / UNBLOCK USER
// POST /api/users/block/:id
// =======================================================
router.post("/block/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: user.isBlocked ? "User blocked 🚫" : "User unblocked ✅"
    });

  } catch (err) {
    console.error("BLOCK ERROR:", err);
    res.status(500).json({ message: "Error updating user" });
  }
});

// =======================================================
// 👑 9. ADMIN: DELETE USER
// DELETE /api/users/delete/:id
// =======================================================
router.delete("/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted 🗑️" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// ================= EXPORT =================
module.exports = router;