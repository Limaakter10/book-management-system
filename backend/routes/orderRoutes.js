// ============================================================
// 📄 orderRoutes.js — Full routes with invoice support
// ============================================================

const express = require("express");
const router  = express.Router();
const Order   = require("../models/Order");
const User    = require("../models/User");

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

// ============================================================
// 📦 GET MY ORDERS — User নিজের orders দেখবে
// GET /api/orders/my/:userId
// ============================================================
router.get("/my/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("books.bookId", "title coverImage price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET MY ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
});

// ============================================================
// 🧾 GET SINGLE ORDER — Invoice download এর জন্য
// GET /api/orders/:orderId
// ============================================================
router.get("/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("userId", "name email phone address")
      .populate("books.bookId", "title coverImage price");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("GET ORDER ERROR:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

// ============================================================
// 🔍 GET ORDER BY TRAN ID — PaymentSuccess page এর জন্য
// GET /api/orders/by-tran/:tranId
// ============================================================
router.get("/by-tran/:tranId", async (req, res) => {
  try {
    const order = await Order.findOne({ tranId: req.params.tranId })
      .populate("userId", "email name phone address")
      .populate("books.bookId", "title coverImage price");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("GET BY TRAN ERROR:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

// ============================================================
// ✅ APPROVE ORDER — Admin approves, books → library
// POST /api/orders/approve/:orderId
// ============================================================
router.post("/approve/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status   = "paid";
    order.approved = true;
    order.paidAt   = new Date();
    await order.save();

    // books গুলো library তে add করো
    const bookIds = order.books.map(b => b.bookId);
    await User.findByIdAndUpdate(order.userId, {
      $addToSet: { library: { $each: bookIds } }
    });

    res.json({ success: true, message: "Order approved & books added to library" });
  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// 🔔 MARK ORDER AS NOTIFIED
// POST /api/orders/notify/:orderId
// ============================================================
router.post("/notify/:orderId", async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.orderId, { notified: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error marking notified" });
  }
});

// ============================================================
// 👤 GET ORDERS BY USER ID (Navbar notification এর জন্য)
// GET /api/orders/user/:userId
// ============================================================
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("books.bookId", "title")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET USER ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ============================================================
// 📋 GET ALL ORDERS — Admin panel
// GET /api/orders/all
// ============================================================
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "email name phone")
      .populate("books.bookId", "title price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

module.exports = router;