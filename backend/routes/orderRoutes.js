const express = require("express");
const router  = express.Router();
const Order   = require("../models/Order");
const User    = require("../models/User");

// ============================================================
// ➕ CREATE ORDER
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
// 📋 GET ALL ORDERS — (🔥 FIXED POSITION)
// ============================================================
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "email name phone address")
      .populate("books.bookId", "title price coverImage")
      .sort({ createdAt: -1 })
      .lean();

    const enriched = orders.map(order => ({
      ...order,
      books: (order.books || []).map(b => ({
        ...b,
        title: b.title || b.bookId?.title || "Unknown",
        price: b.price || b.bookId?.price || 0,
      })),
    }));

    res.json(enriched);
  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ============================================================
// 📦 GET MY ORDERS
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
// 🔍 GET ORDER BY TRAN ID
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
// 👤 GET ORDERS BY USER
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
// 🧾 GET SINGLE ORDER (🔥 LAST e rakhsi)
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
// ✅ APPROVE ORDER
// ============================================================
router.post("/approve/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status   = "paid";
    order.approved = true;
    order.paidAt   = new Date();
    await order.save();

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
// 🔔 NOTIFY
// ============================================================
router.post("/notify/:orderId", async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.orderId, { notified: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error marking notified" });
  }
});

module.exports = router;