// ============================================================
// 📄 orderRoutes.js
// ============================================================

const express = require("express");
const router  = express.Router();
const Order   = require("../models/Order");
const User    = require("../models/User");

// ============================================================
// ✅ APPROVE ORDER (existing — unchanged)
// POST /api/orders/approve/:orderId
// ============================================================
router.post("/approve/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "approved";
    await order.save();

    await User.findByIdAndUpdate(order.userId, {
      $addToSet: { library: { $each: order.books } }
    });

    res.json({ success: true, message: "Order approved & books added" });

  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// 📋 GET ALL ORDERS — Admin panel
// GET /api/orders/all
// user email + name populate করে দেখাবে
// ============================================================
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "email name")  // ← user এর email আনো
      .populate("books.bookId", "title") // ← book title
      .sort({ createdAt: -1 });          // ← নতুন আগে

    res.json(orders);

  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ============================================================
// 🔍 GET ORDER BY TRAN ID — Invoice এর জন্য
// GET /api/orders/by-tran/:tranId
// PaymentSuccess page এই route call করবে
// ============================================================
router.get("/by-tran/:tranId", async (req, res) => {
  try {
    const order = await Order.findOne({ tranId: req.params.tranId })
      .populate("userId", "email name")
      .populate("books.bookId", "title");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);

  } catch (err) {
    console.error("GET BY TRAN ERROR:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

// ============================================================
// 📦 GET MY ORDERS — User নিজের orders দেখবে
// GET /api/orders/my/:userId
// ============================================================
router.get("/my/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("books.bookId", "title")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    console.error("GET MY ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
});

// ============================================================
// ➕ CREATE ORDER
// POST /api/orders
// ============================================================
router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json({ message: "Order placed", order });

  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ message: "Order creation failed", error: err });
  }
});

module.exports = router;
